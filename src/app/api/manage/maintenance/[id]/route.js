import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import connectDB from "../../../../../lib/db";
import Maintenance from "../../../../../lib/models/Maintenance";

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { status, resolutionNotes } = body;
    const { id: ticketId } = await params;

    if (!ticketId || !status) {
      return NextResponse.json({ error: "Missing ID or status" }, { status: 400 });
    }

    await connectDB();
    const ticket = await Maintenance.findById(ticketId).populate('property tenant landlord');
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    const isLandlord = ["seller", "admin", "broker"].includes(user.role);
    if (!isLandlord) {
      return NextResponse.json({ error: "Only landlords can update ticket status" }, { status: 403 });
    }

    let updateData = { status };
    if (resolutionNotes) {
      updateData.resolutionNotes = resolutionNotes;
    }

    if (status === "resolved" || status === "closed") {
      updateData.resolvedAt = new Date();
    }

    const updatedTicket = await Maintenance.findByIdAndUpdate(ticketId, updateData, { new: true })
      .populate('property', 'title location.address')
      .populate('tenant', 'name email avatar')
      .populate('landlord', 'name email avatar');

    return NextResponse.json({ ticket: updatedTicket });
  } catch (error) {
    console.error("[MAINTENANCE_ID_PATCH]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}