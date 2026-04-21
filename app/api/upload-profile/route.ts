import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getMongoDb, isMongoConfigured } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_Access_Key_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_Secret_Access_Key;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: Request) {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json(
        { error: 'MongoDB is not configured' },
        { status: 503 }
      );
    }
    if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
      return NextResponse.json(
        { error: 'R2 storage is not configured' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('user_id') as string | null;

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create unique file name
    const extension = file.name.split('.').pop() || 'png';
    const fileName = `profiles/${userId}-${crypto.randomUUID()}.${extension}`;

    // Upload to R2
    const uploadCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(uploadCommand);

    const imageUrl = `${R2_PUBLIC_BASE_URL}/${fileName}`;

    // Update MongoDB
    const db = await getMongoDb();
    
    // Update users collection
    let userFilter = {};
    try {
      userFilter = { _id: new ObjectId(userId) };
    } catch {
      userFilter = { user_id: userId };
    }
    await db.collection('users').updateOne(
      userFilter, 
      { $set: { profile_image_url: imageUrl } }
    );

    // Also update user_profiles collection
    await db.collection('user_profiles').updateOne(
      { user_id: userId },
      { $set: { profile_image_url: imageUrl } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
