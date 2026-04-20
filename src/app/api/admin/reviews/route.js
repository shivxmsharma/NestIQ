import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import dbConnect from '../../../lib/db';
import Review from '../../../lib/models/Review';
import User from '../../../lib/models/User';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    // Only admins can view all reviews without filters in this endpoint mapping,
    // though users might have their own public review scopes later.
    const userRole = await User.findById(session.user.id).select('role');
    if (userRole?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const reviews = await Review.find()
      .populate('reviewer', 'name email avatar')
      .populate('reviewee', 'name email role avatar')
      .populate('property', 'title location')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error('Fetch Reviews Admin Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
