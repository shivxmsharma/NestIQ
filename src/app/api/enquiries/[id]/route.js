import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/db';
import Enquiry from '../../../../lib/models/Enquiry';
import { NextResponse } from 'next/server';
import { sendVisitStatusEmail } from '../../../../lib/emailTemplates';

export async function GET(request, context) {
  const params = await context.params;

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const enquiry = await Enquiry.findById(params.id)
    .populate('property', 'title photos price listingType address')
    .populate('buyer', 'name email phone avatar')
    .populate('owner', 'name email phone avatar')
    .lean();

  if (!enquiry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isBuyer = enquiry.buyer._id.toString() === session.user.id;
  const isOwner = enquiry.owner._id.toString() === session.user.id;
  if (!isBuyer && !isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (isOwner && !enquiry.isRead) {
    await Enquiry.findByIdAndUpdate(params.id, { isRead: true });
  }

  return NextResponse.json({ enquiry });
}

export async function PUT(request, context) {
  const params = await context.params;

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const enquiry = await Enquiry.findById(params.id);
  if (!enquiry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isBuyer = enquiry.buyer.toString() === session.user.id;
  const isOwner = enquiry.owner.toString() === session.user.id;
  if (!isBuyer && !isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const updates = {};

  if (isOwner) {
    if (body.status) updates.status = body.status;
    if (body.ownerResponse) updates.ownerResponse = body.ownerResponse;
    if (body.visitStatus) updates.visitStatus = body.visitStatus;
    updates.isRead = true;
  }

  if (isBuyer) {
    if (body.status === 'closed') updates.status = 'closed';
    if (body.visitDate) updates.visitDate = body.visitDate;
    if (body.visitTime) updates.visitTime = body.visitTime;
  }

  const updated = await Enquiry.findByIdAndUpdate(params.id, updates, { new: true })
    .populate('property', 'title photos price listingType address')
    .populate('buyer', 'name email phone avatar')
    .populate('owner', 'name email phone avatar');

  if (
    isOwner &&
    (body.visitStatus === "confirmed" || body.visitStatus === "cancelled") &&
    updated.buyer?.email
  ) {
    const addr = updated.property?.address;
    const propertyAddress = addr
      ? `${addr.locality}, ${addr.city}`
      : "the property";

    sendVisitStatusEmail({
      buyerEmail: updated.buyer.email,
      buyerName: updated.buyer.name || updated.name,
      propertyAddress,
      visitDate: updated.visitDate,
      visitTime: updated.visitTime,
      status: body.visitStatus,
    }).catch(() => { }); // fire-and-forget — email failure won't break the response
  }

  return NextResponse.json({ enquiry: updated });
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const enquiry = await Enquiry.findById(params.id);
  if (!enquiry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (enquiry.buyer.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await enquiry.deleteOne();
  return NextResponse.json({ success: true });
}