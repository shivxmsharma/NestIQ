import { NextResponse } from "next/server";
import connectDB from '../../../../lib/db';
import Property from '../../../../lib/models/Property';
import { getPropertiesIndex } from "../../../../lib/algolia";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 401 });
    }

    await connectDB();
    const properties = await Property.find({ status: 'active' }).lean();
    const index = getPropertiesIndex();

    const records = properties.map((p) => {
      const locality = p.address?.locality || '';
      const city = p.address?.city || '';
      const beds = p.details?.bedrooms;
      const record = {
        objectID: p._id.toString(),
        title:
          p.title ||
          `${beds ? beds + ' BHK ' : ''}${p.propertyType} in ${locality}, ${city}`,
        listingType: p.listingType,
        propertyType: p.propertyType,
        price: p.price || 0,
        city,
        locality,
        state: p.address?.state || '',
        bedrooms: p.details?.bedrooms || 0,
        bathrooms: p.details?.bathrooms || 0,
        area: p.details?.area || 0,
        furnishing: p.details?.furnishing || '',
        isReraVerified: p.isReraVerified || false,
        trustScore: p.trustScore || 70,
        coverPhoto: p.photos?.[0]?.url || '',
        amenities: p.amenities || [],
        status: p.status || 'active',
        createdAt: p.createdAt ? new Date(p.createdAt).getTime() : Date.now(),
      };

      if (p.location?.coordinates?.length === 2) {
        record._geoloc = {
          lat: p.location.coordinates[1],
          lng: p.location.coordinates[0],
        };
      }
      return record;
    });

    await index.saveObjects(records);
    return NextResponse.json({ success: true, synced: records.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}