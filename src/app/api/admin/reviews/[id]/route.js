import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import dbConnect from '../../../../../lib/db';
import Review from '../../../../../lib/models/Review';
import User from '../../../../../lib/models/User';

// Status update (hide / flag / publish)
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const adminUser = await User.findById(session.user.id).select('role');
    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    review.status = body.status;
    await review.save();

    return NextResponse.json({ message: 'Review status sorted', review }, { status: 200 });
  } catch (error) {
    console.error('Update Review Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
