import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, message } = await req.json();

    if (!firstName || !email || !message) {
      return NextResponse.json(
        { error: 'First name, email, and message are required.' },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    const result = await db.collection('feedback').insertOne({
      firstName,
      lastName,
      email,
      message,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Failed to save feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getMongoDb();
    const feedbacks = await db.collection('feedback').find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ feedbacks }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch feedbacks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedbacks.' },
      { status: 500 }
    );
  }
}
