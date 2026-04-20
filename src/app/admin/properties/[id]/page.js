import React from "react";
import connectDB from "../../../../lib/db";
import Property from "../../../../lib/models/Property";
import User from "../../../../lib/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, XCircle, ArrowLeft, MapPin, Building2, Calendar, Clock, IndianRupee } from "lucide-react";
import AdminPropertyActions from "../../../../components/admin/AdminPropertyActions";

export const dynamic = "force-dynamic";

export default async function AdminPropertyDetailsPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  await connectDB();
  const { id } = await params;

  // Fetch the specific property
  const property = await Property.findById(id).populate("landlord", "name email phone").lean();

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Property Not Found</h2>
        <p className="text-gray-400 mb-6">The property you are looking for does not exist.</p>
        <Link href="/admin/properties" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
          Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/properties" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Directory
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{property.title}</h1>
          <p className="text-gray-400 flex items-center gap-1.5 mt-1">
            <MapPin className="w-4 h-4" />
            {property.location.address}, {property.location.city}, {property.location.state} {property.location.zipCode}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AdminPropertyActions propertyId={property._id.toString()} initialStatus={property.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Images & Key Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Property Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {property.images && property.images.length > 0 ? (
                property.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
                    <Image src={img} alt={`Property Image ${idx + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))
              ) : (
                <div className="col-span-full aspect-video bg-black/40 rounded-xl flex items-center justify-center border border-white/5">
                  <span className="text-gray-500">No images uploaded</span>
                </div>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <span className="text-sm text-gray-500 block mb-1">Monthly Rent</span>
                <span className="text-xl font-bold text-white flex items-center"><IndianRupee className="w-4 h-4 mr-0.5" />{property.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <span className="text-sm text-gray-500 block mb-1">Security Deposit</span>
                <span className="text-xl font-bold text-white flex items-center"><IndianRupee className="w-4 h-4 mr-0.5" />{property.securityDeposit.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <span className="text-sm text-gray-500 block mb-1">Property Type</span>
                <span className="text-xl font-bold text-white capitalize">{property.type}</span>
              </div>
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <span className="text-sm text-gray-500 block mb-1">Configuration</span>
                <span className="text-xl font-bold text-white capitalize">{property.bedrooms}BHK {property.furnishing}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{property.description}</p>
          </div>
        </div>

        {/* Right Column: Landlord Card & Metadata */}
        <div className="space-y-6">
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Building2 className="w-32 h-32 text-indigo-500" />
            </div>
            <h2 className="text-lg font-bold text-white mb-4 relative z-10">Landlord Profile</h2>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 font-bold text-xl">
                {property.landlord?.name?.charAt(0) || "L"}
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">{property.landlord?.name || "Unknown Landlord"}</h3>
                <p className="text-gray-400 text-sm">Property Owner</p>
              </div>
            </div>
            <div className="space-y-3 mt-6 border-t border-white/10 pt-6 relative z-10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-300">{property.landlord?.email || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium text-gray-300">{property.landlord?.phone || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">System Metadata</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-500 shrink-0" />
                <div>
                  <span className="text-sm font-medium text-white block">Listed On</span>
                  <span className="text-xs text-gray-400">{new Date(property.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-500 shrink-0" />
                <div>
                  <span className="text-sm font-medium text-white block">Last Updated</span>
                  <span className="text-xs text-gray-400">{new Date(property.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}