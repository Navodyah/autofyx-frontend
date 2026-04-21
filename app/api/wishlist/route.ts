import { NextResponse } from 'next/server';
import { getMongoDb, isMongoConfigured } from '@/lib/mongodb';

// GET /api/wishlist?user_id=xyz
export async function GET(request: Request) {
  try {
    if (!isMongoConfigured()) return NextResponse.json({ error: 'MongoDB not configured' }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) return NextResponse.json({ error: 'user_id is required' }, { status: 400 });

    const db = await getMongoDb();
    
    // Find wishlist document for user
    const wishlist = await db.collection('user_wishlist').findOne({ user_id: userId });
    
    if (!wishlist) {
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json({ items: wishlist.vehicle_ids || [] });
  } catch (error) {
    console.error('Failed to get wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// POST /api/wishlist
// Body: { user_id: "xyz", vehicle_id: 123, action: "add" | "remove" }
export async function POST(request: Request) {
  try {
    if (!isMongoConfigured()) return NextResponse.json({ error: 'MongoDB not configured' }, { status: 503 });

    const body = await request.json();
    const { user_id, vehicle_id, action } = body;

    if (!user_id || !vehicle_id || !action) {
      return NextResponse.json({ error: 'user_id, vehicle_id, and action are required' }, { status: 400 });
    }

    const db = await getMongoDb();
    const collection = db.collection('user_wishlist');

    if (action === 'add') {
      await collection.updateOne(
        { user_id },
        { 
          $addToSet: { vehicle_ids: vehicle_id },
          $set: { updated_at: new Date() }
        },
        { upsert: true }
      );
    } else if (action === 'remove') {
      await collection.updateOne(
        { user_id },
        { 
          $pull: { vehicle_ids: vehicle_id },
          $set: { updated_at: new Date() }
        }
      );
    } else {
      return NextResponse.json({ error: 'Invalid action. Use "add" or "remove"' }, { status: 400 });
    }

    // Return the updated list
    const updated = await collection.findOne({ user_id });
    return NextResponse.json({ success: true, items: updated?.vehicle_ids || [] });
  } catch (error) {
    console.error('Failed to update wishlist:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}
