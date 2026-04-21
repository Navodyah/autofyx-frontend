import { NextResponse } from 'next/server';

import { getMongoDb, isMongoConfigured } from '@/lib/mongodb';

type PreferencePayload = {
  user_id?: string;
  appwrite_id?: string;
  email?: string;
  username?: string;
  user_type?: 'user' | 'admin' | 'researcher' | string;
  monthly_salary_range: string;
  daily_distance_km: number;
  usage_purpose: 'Office' | 'Family' | 'Travel' | 'Rent';
  fuel_preference: 'Petrol' | 'Hybrid' | 'Electric' | 'Diesel';
  priority: 'Fuel Efficiency' | 'Resale Value' | 'Comfort' | 'Performance';
  preferred_vehicle_types?: string[];
  budget_min?: number;
  budget_max?: number;
};

function validatePayload(body: Partial<PreferencePayload>): body is PreferencePayload {
  if (!body || typeof body !== 'object') return false;
  if (!body.monthly_salary_range || typeof body.monthly_salary_range !== 'string') return false;
  if (typeof body.daily_distance_km !== 'number' || Number.isNaN(body.daily_distance_km) || body.daily_distance_km < 0) return false;
  if (!body.usage_purpose || typeof body.usage_purpose !== 'string') return false;
  if (!body.fuel_preference || typeof body.fuel_preference !== 'string') return false;
  if (!body.priority || typeof body.priority !== 'string') return false;
  
  if (body.preferred_vehicle_types && !Array.isArray(body.preferred_vehicle_types)) return false;
  if (body.budget_min !== undefined && typeof body.budget_min !== 'number') return false;
  if (body.budget_max !== undefined && typeof body.budget_max !== 'number') return false;
  
  return true;
}

function buildSelector(payload: PreferencePayload): Record<string, unknown> {
  if (payload.user_id) return { user_id: payload.user_id };
  if (payload.appwrite_id) return { appwrite_id: payload.appwrite_id };
  if (payload.email) return { email: payload.email.toLowerCase() };
  throw new Error('One identifier is required: user_id, appwrite_id, or email');
}

function buildSelectorFromQuery(request: Request): Record<string, unknown> {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const appwriteId = searchParams.get('appwrite_id');
  const email = searchParams.get('email');

  if (userId) return { user_id: userId };
  if (appwriteId) return { appwrite_id: appwriteId };
  if (email) return { email: email.toLowerCase() };
  throw new Error('One query parameter is required: user_id, appwrite_id, or email');
}

export async function GET(request: Request) {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json(
        {
          error:
            'Preferences service is not configured. Add MONGODB_URI in frontend/autofyx/.env and restart Next.js.',
        },
        { status: 503 }
      );
    }

    let selector: Record<string, unknown>;
    try {
      selector = buildSelectorFromQuery(request);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid query payload' },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    const collection = db.collection('user_preferences');
    const preferences = await collection.findOne(selector);

    if (!preferences) {
      return NextResponse.json({ error: 'Preferences not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user preferences';
    const status = message.toLowerCase().includes('missing mongodb connection string') ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json(
        {
          error:
            'Preferences service is not configured. Add MONGODB_URI in frontend/autofyx/.env and restart Next.js.',
        },
        { status: 503 }
      );
    }

    const body = (await request.json()) as Partial<PreferencePayload>;

    if (!validatePayload(body)) {
      return NextResponse.json(
        { error: 'Invalid preference payload' },
        { status: 400 }
      );
    }

    let selector: Record<string, unknown>;
    try {
      selector = buildSelector(body);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid identity payload' },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    const collection = db.collection('user_preferences');

    const now = new Date();
    const document = {
      user_id: body.user_id || null,
      appwrite_id: body.appwrite_id || null,
      email: body.email?.toLowerCase() || null,
      username: body.username || null,
      user_type: body.user_type || 'user',
      monthly_salary_range: body.monthly_salary_range,
      daily_distance_km: body.daily_distance_km,
      usage_purpose: body.usage_purpose,
      fuel_preference: body.fuel_preference,
      priority: body.priority,
      preferred_vehicle_types: body.preferred_vehicle_types || [],
      budget_min: body.budget_min || 0,
      budget_max: body.budget_max || 0,
      onboarding_completed: true,
      updated_at: now,
    };

    await collection.updateOne(
      selector,
      {
        $set: document,
        $setOnInsert: { created_at: now },
      },
      { upsert: true }
    );

    const saved = await collection.findOne(selector);

    return NextResponse.json({
      success: true,
      preferences: saved,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save user preferences';
    const status = message.toLowerCase().includes('missing mongodb connection string') ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
