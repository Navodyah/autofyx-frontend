import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// 1. Backend එකෙන් ඉල්ලන හරියටම Values ටික Zod වලින් Define කිරීම
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
      return NextResponse.json({ message: "Missing search text" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: "Missing GEMINI_API_KEY configuration" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // 2. The Prompt: යූසර්ගේ ඕනෑම කතාවක් තේරුම් ගන්න AI එකට දෙන නීති මාලාව
    const systemInstruction = `
You are an expert AI vehicle recommender assistant. Read the user's paragraph or text, deeply understand their requirements, and extract the parameters into a strictly valid JSON.

Rules & Mappings:
1. 'purpose' (Must be exactly one of):
   - "daily_commute" (for economy, daily driving, work, budget-friendly)
   - "family" (for kids, space, safety, SUVs, minivans)
   - "performance" (for speed, sports, racing, horsepower)
   - "luxury" (for comfort, premium, status)
2. 'area' (Must be exactly one of):
   - "city" (urban, traffic, short trips)
   - "highway" (long trips, inter-city, smooth roads)
   - "mixed" (general use, both city and outstation)
   - "off-road" (rough terrain, 4x4, adventure)
3. 'fuel' (Map to these exact types if mentioned):
   - "X" (for Regular Petrol/Gasoline)
   - "Z" (for Premium Petrol)
   - "D" (for Diesel)
   - "E" (for Electric/Battery)
4. 'transmission' (Map to these exact types if mentioned):
   - "A" (for Automatic)
   - "MANUAL" (for Manual)
5. 'max_comb_l_per_100': Extract max fuel consumption if mentioned (e.g., "max 8L/100km" -> 8).
6. 'vehicle_class': If they explicitly ask for an SUV, COMPACT, MINIVAN, etc., output the type in uppercase.

If a specific constraint is NOT mentioned in the user's text, leave it blank/omitted (Do not invent data). Provide the best matching 'purpose' and 'area' based on context.
`;

    const jsonSchema = zodToJsonSchema(RecommendRequestSchema as any, { 
      target: "openApi3" 
    }) as any;

    // 3. Send text to Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemInstruction}\n\nUser Text:\n"${text}"` }] },
      ],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: jsonSchema,
      },
    });

    const parsed = JSON.parse(response.text || "{}");

    // 4. Override Logic: UI එකෙන් (LKR Box එකෙන්) ගාණක් දීලා නම්, AI එක හදපු 'salary_level' එක මකා දමන්න. 
    // එවිට Backend එක හරියටම ඔයාගේ මුදලින් ගණනය කිරීම් කරයි.
    if (monthly_income !== undefined && monthly_income !== null && monthly_income > 0) {
      parsed.monthly_income = monthly_income;
      delete parsed.salary_level; 
    }

    // 5. Zod Validation: Backend එකට යන්න කලින් වැරදි දත්ත තියෙනවා නම් අයින් කරනවා
    const finalObj: RecommendRequest = RecommendRequestSchema.parse(parsed);

    // Frontend එකට සුද්ද කරපු Parameters ටික යවනවා
    return NextResponse.json({ ok: true, params: finalObj });

  } catch (e: any) {
    console.error("Parse Error:", e);
    return NextResponse.json(
      { ok: false, message: e?.message || "Failed to parse parameters from AI" },
      { status: 500 }
    );
  }
}