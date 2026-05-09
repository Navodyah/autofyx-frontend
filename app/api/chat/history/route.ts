import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "autofyx";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(dbName);
    const chats = await db.collection("chat_history").find({ userId }).sort({ updatedAt: -1 }).toArray();
    
    return NextResponse.json({ chats });
  } catch (error) {
    console.error("Failed to fetch chat history:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, sessionId, messages, title } = body;
    
    if (!userId || !sessionId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(dbName);
    
    await db.collection("chat_history").updateOne(
      { sessionId, userId },
      { 
        $set: { messages, title: title || "New Chat", updatedAt: new Date() }, 
        $setOnInsert: { createdAt: new Date() } 
      },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save chat history:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
