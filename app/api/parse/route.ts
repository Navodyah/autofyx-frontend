import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod/v3";

const Purpose = z.enum(["daily_commute", "family", "performance", "luxury"]);
const Area = z.enum(["city", "highway", "mixed", "off-road"]);

const RecommendRequestSchema = z.object({
  salary: z.number().positive().optional(),
  rate_of_interest: z.number().min(0).optional(),
  number_of_months: z.number().int().positive().optional(),
  down_payment_amount: z.number().min(0).optional(),
  down_payment_ratio: z.number().min(0).max(1).optional(),
  purpose: Purpose.optional(),
  area: Area.optional(),
  fuel: z.enum(["X", "Z", "D", "E"]).optional(),
  transmission: z.enum(["A", "MANUAL"]).optional(),
  max_comb_l_per_100: z.number().positive().optional(),
  vehicle_class: z.string().trim().min(1).optional(),
  top_n: z.number().int().min(1).max(50).optional(),
  candidate_limit: z.number().int().min(100).max(20000).optional(),
});

type RecommendRequest = z.infer<typeof RecommendRequestSchema>;

const responseJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    salary: { type: "number" },
    rate_of_interest: { type: "number" },
    number_of_months: { type: "integer" },
    down_payment_amount: { type: "number" },
    down_payment_ratio: { type: "number" },
    purpose: { type: "string", enum: ["daily_commute", "family", "performance", "luxury"] },
    area: { type: "string", enum: ["city", "highway", "mixed", "off-road"] },
    fuel: { type: "string", enum: ["X", "Z", "D", "E"] },
    transmission: { type: "string", enum: ["A", "MANUAL"] },
    max_comb_l_per_100: { type: "number" },
    vehicle_class: { type: "string" },
    top_n: { type: "integer" },
    candidate_limit: { type: "integer" },
  },
} as const;

export async function POST(req: Request) {
  try {
    const { text, salary } = (await req.json()) as { text?: string; salary?: number };

    if (!text?.trim()) {
      return NextResponse.json({ ok: false, message: "Missing search text" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, message: "Missing GEMINI_API_KEY configuration" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `
You are an expert AI vehicle recommender assistant. Read the user's text and extract only the recommendation parameters that are clearly stated or strongly implied.

Rules:
1. purpose must be one of: daily_commute, family, performance, luxury.
2. area must be one of: city, highway, mixed, off-road.
3. fuel must be one of: X (regular petrol), Z (premium petrol), D (diesel), E (electric).
4. transmission must be one of: A (automatic), MANUAL (manual).
5. Extract max_comb_l_per_100 as a number when a fuel-consumption limit is mentioned.
6. Extract salary only if monthly income is mentioned.
7. Extract finance fields if the user mentions interest rate, months, down payment amount, or down payment ratio.
8. Output vehicle_class in uppercase if a class such as SUV, COMPACT, or MINIVAN is mentioned.
9. If a field is not mentioned, omit it. Do not invent values.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemInstruction}\n\nUser text:\n${text}` }] },
      ],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    if (salary !== undefined && salary !== null && salary > 0) {
      parsed.salary = salary;
    }

    const finalObj: RecommendRequest = RecommendRequestSchema.parse(parsed);
    if (finalObj.vehicle_class) {
      finalObj.vehicle_class = finalObj.vehicle_class.toUpperCase();
    }

    return NextResponse.json({ ok: true, params: finalObj });
  } catch (error: unknown) {
    console.error("Parse Error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to parse parameters from AI",
      },
      { status: 500 }
    );
  }
}
