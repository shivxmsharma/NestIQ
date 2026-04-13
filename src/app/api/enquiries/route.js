import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import connectDB from '../../../lib/db';
import Enquiry from '../../../lib/models/Enquiry';
import Property from '../../../lib/models/Property';
import { NextResponse } from 'next/server';

// GET /api/enquiries?type=sent|received&page=1
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'sent';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 10;

  const filter = type === 'received' ? { owner: session.user.id } : { buyer: session.user.id };

  const [enquiries, total] = await Promise.all([
    Enquiry.find(filter)
      .populate('property', 'title photos price listingType propertyType address details')
      .populate('buyer', 'name email phone avatar')
      .populate('owner', 'name email phone avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Enquiry.countDocuments(filter),
  ]);

  return NextResponse.json({ enquiries, total, page, pages: Math.ceil(total / limit) });
}

// POST /api/enquiries — create enquiry
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { propertyId, name, email, phone, message, enquiryType, visitDate, visitTime } = await request.json();

  if (!propertyId || !name || !email || !phone) {
    return NextResponse.json({ error: 'Name, email, phone and propertyId are required.' }, { status: 400 });
  }

  const property = await Property.findById(propertyId).select('owner title');
  if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

  if (property.owner.toString() === session.user.id) {
    return NextResponse.json({ error: 'You cannot enquire on your own property.' }, { status: 400 });
  }

  const existing = await Enquiry.findOne({
    property: propertyId,
    buyer: session.user.id,
    status: { $ne: 'closed' },
  });
  if (existing) {
    return NextResponse.json({ error: 'You already have an active enquiry for this property.' }, { status: 409 });
  }

  const enquiry = await Enquiry.create({
    property: propertyId,
    buyer: session.user.id,
    owner: property.owner,
    name, email, phone, message,
    enquiryType: enquiryType || 'general',
    visitDate: enquiryType === 'visit' ? visitDate : undefined,
    visitTime: enquiryType === 'visit' ? visitTime : undefined,
    visitStatus: enquiryType === 'visit' ? 'requested' : undefined,
  });

  return NextResponse.json({ enquiry }, { status: 201 });
}