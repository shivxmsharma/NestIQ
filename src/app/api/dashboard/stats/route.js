import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/db';
import Property from '../../../../lib/models/Property';
import Enquiry from '../../../../lib/models/Enquiry';
import User from '../../../../lib/models/User';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const userId = session.user.id;
  const oid = new mongoose.Types.ObjectId(userId);

  const [
    myListings,
    activeListings,
    enquiriesReceived,
    unreadEnquiries,
    enquiriesSent,
    user,
    visitsScheduled,
    viewsAgg,
  ] = await Promise.all([
    Property.countDocuments({ owner: userId }),
    Property.countDocuments({ owner: userId, status: 'active' }),
    Enquiry.countDocuments({ owner: userId }),
    Enquiry.countDocuments({ owner: userId, isRead: false }),
    Enquiry.countDocuments({ buyer: userId }),
    User.findById(userId).select('savedProperties').lean(),
    Enquiry.countDocuments({ buyer: userId, enquiryType: 'visit' }),
    Property.aggregate([
      { $match: { owner: oid } },
      { $group: { _id: null, total: { $sum: '$views' } } },
    ]),
  ]);

  return NextResponse.json({
    myListings,
    activeListings,
    enquiriesReceived,
    unreadEnquiries,
    enquiriesSent,
    savedCount: user?.savedProperties?.length || 0,
    visitsScheduled,
    totalViews: viewsAgg[0]?.total || 0,
  });
}