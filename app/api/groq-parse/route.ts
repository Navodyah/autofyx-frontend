import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { z } from "zod/v3";

/* ── Validation schema (mirrors backend) ───────────────────────────────── */
const ParamsSchema = z.object({
  salary:               z.number().positive().optional(),
  purpose:              z.enum(["daily_commute", "family", "performance", "luxury"]).optional(),
  area:                 z.enum(["city", "highway", "mixed", "off-road"]).optional(),
  fuel:                 z.enum(["X", "Z", "D", "E"]).optional(),
  transmission:         z.enum(["A", "Manual"]).optional(),
  max_comb_l_per_100:   z.number().positive().optional(),
  vehicle_class:        z.string().trim().min(1).optional(),
  rate_of_interest:     z.number().min(0).optional(),
  number_of_months:     z.number().int().positive().optional(),
  down_payment_amount:  z.number().min(0).optional(),
  down_payment_ratio:   z.number().min(0).max(1).optional(),
  maintainability_priority: z.enum(["high", "average", "none"]).optional(),
});
type Params = z.infer<typeof ParamsSchema>;

const SYSTEM_PROMPT = `You are an expert AI vehicle recommender assistant for Sri Lanka.
Read the user's natural language query and extract vehicle recommendation parameters.

Rules:
1. purpose: one of daily_commute | family | performance | luxury
2. area: one of city | highway | mixed | off-road
3. fuel: X=regular petrol, Z=premium petrol, D=diesel, E=electric
4. transmission: A=automatic, Manual=manual
5. salary: monthly income in LKR (extract number only, e.g. "250,000" → 250000)
6. max_comb_l_per_100: fuel consumption limit in L/100km
7. vehicle_class: output in UPPERCASE if mentioned (SUV, COMPACT, MPV, etc.)
8. rate_of_interest: loan interest % per year
9. number_of_months: loan tenure in months
10. down_payment_amount: in LKR
11. down_payment_ratio: fraction 0-1
12. maintainability_priority: high | average | none

CRITICAL: Only extract fields that are clearly mentioned or strongly implied. Omit everything else.
Respond ONLY with a valid JSON object. No markdown, no explanation.

Examples:
- "family SUV for city, diesel, 300k salary" → {"salary":300000,"purpose":"family","area":"city","fuel":"D","vehicle_class":"SUV"}
- "I earn 500k, want eco highway commute" → {"salary":500000,"purpose":"daily_commute","area":"highway"}
- "luxury automatic car, premium petrol, 12% interest 48 months" → {"purpose":"luxury","fuel":"Z","transmission":"A","rate_of_interest":12,"number_of_months":48}`;

export async function POST(req: Request) {
  try {
    const { text } = (await req.json()) as { text?: string };

    if (!text?.trim()) {
      return NextResponse.json({ ok: false, message: "Missing search text" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, message: "GROQ_API_KEY not configured" }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: text },
      ],
      temperature: 0.1,
      max_tokens: 512,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ ok: false, message: "AI returned invalid JSON" }, { status: 500 });
    }

    /* Normalise vehicle_class to uppercase */
    if (typeof parsed.vehicle_class === "string") {
      parsed.vehicle_class = parsed.vehicle_class.toUpperCase();
    }

    const result: Params = ParamsSchema.parse(parsed);
    return NextResponse.json({ ok: true, params: result });

  } catch (error: unknown) {
    console.error("[groq-parse] error:", error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Parse failed" },
      { status: 500 },
    );
  }
}
