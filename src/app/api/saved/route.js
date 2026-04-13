import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import connectDB from '../../../lib/db';
import User from '../../../lib/models/User';
import { NextResponse } from 'next/server';

// GET — fetch saved property list
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const user = await User.findById(session.user.id)
    .populate({
      path: 'savedProperties',
      select: 'title photos price listingType propertyType address details trustScore isReraVerified status',
    })
    .lean();

  return NextResponse.json({ saved: user?.savedProperties || [] });
}

// POST — toggle save/unsave
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { propertyId } = await request.json();
  if (!propertyId) return NextResponse.json({ error: 'propertyId required' }, { status: 400 });

  const user = await User.findById(session.user.id);
  const isSaved = user.savedProperties.map(id => id.toString()).includes(propertyId);

  if (isSaved) {
    user.savedProperties.pull(propertyId);
  } else {
    user.savedProperties.addToSet(propertyId);
  }
  await user.save();

  return NextResponse.json({ saved: !isSaved, count: user.savedProperties.length });
}