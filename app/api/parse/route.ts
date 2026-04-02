import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const SalaryLevel = z.enum(["low", "medium", "high", "luxury"]);
const Purpose = z.enum(["daily_commute", "family", "performance", "luxury"]);
const Area = z.enum(["city", "highway", "mixed", "off-road"]);

const RecommendRequestSchema = z.object({
  monthly_income: z.number().optional(),
  salary_level: SalaryLevel.optional(),

  purpose: Purpose.default("daily_commute"),
  area: Area.default("mixed"),

  fuel: z.string().optional(),
  transmission: z.string().optional(),
  max_comb_l_per_100: z.number().optional(),
  vehicle_class: z.string().optional(),

  top_n: z.number().default(10),
  candidate_limit: z.number().default(2000),
});

type RecommendRequest = z.infer<typeof RecommendRequestSchema>;

export async function POST(req: Request) {
  try {
    const { text, monthly_income } = (await req.json()) as { text?: string; monthly_income?: number };

if (!text?.trim()) { 
      return NextResponse.json({ message: "Missing text" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
You are an assistant that extracts vehicle recommendation parameters from user text.
Return ONLY valid JSON matching the provided schema.
Rules:
- purpose must be one of: daily_commute | family | performance | luxury
- area must be one of: city | highway | mixed | off-road
- salary_level must be low|medium|high|luxury ONLY if explicitly mentioned OR can be inferred from income:
  income < 150000 => low
  150000-600000 => medium
  600000-999999 => high
  >= 1000000 => luxury
- fuel should match common options like:
  "D - Diesel" | "X - Regular Gasoline" | "Z - Premium Gasoline"
- transmission examples:
  "A=Automatic" | "Manual"
If a field is not mentioned, omit it (except purpose and area; infer sensible defaults: purpose=daily_commute, area=mixed).
Top_n default 10, candidate_limit default 2000.
`;

    const jsonSchema = zodToJsonSchema(RecommendRequestSchema as any, { 
      target: "openApi3" 
    }) as any;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemInstruction}\n\nUser text:\n${text}` }] },
      ],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: jsonSchema,
      },
    });

    // Gemini returns JSON text
    const parsed = JSON.parse(response.text || "{}");

    // Validate (and fill defaults)
    const finalObj: RecommendRequest = RecommendRequestSchema.parse({ ...parsed, monthly_income: monthly_income || parsed.monthly_income,});

    return NextResponse.json({ ok: true, params: finalObj });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || "Parse failed" },
      { status: 500 }
    );
  }
}