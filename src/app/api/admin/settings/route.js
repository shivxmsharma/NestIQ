import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import dbConnect from '../../../../lib/db';
import PlatformSettings from '../../../../lib/models/PlatformSettings';
import User from '../../../../lib/models/User';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const userRole = await User.findById(session.user.id).select('role');
    if (userRole?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let settings = await PlatformSettings.findOne({});
    if (!settings) {
      // Create defaults if empty
      settings = await PlatformSettings.create({});
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Settings Fetch Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const userRole = await User.findById(session.user.id).select('role');
    if (userRole?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();

    // Find singleton or update
    const settings = await PlatformSettings.findOne({});
    let updated;

    if (!settings) {
      updated = await PlatformSettings.create(data);
    } else {
      updated = await PlatformSettings.findOneAndUpdate({ _id: settings._id }, { $set: data }, { new: true });
    }

    return NextResponse.json({ message: 'Platform settings updated successfully', settings: updated }, { status: 200 });
  } catch (error) {
    console.error('Settings Update Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
