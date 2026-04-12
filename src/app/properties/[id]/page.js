"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import {
  MapPin, BedDouble, Bath, Maximize2, BadgeCheck, Zap,
  Phone, MessageSquare, Calendar, Share2, Heart, ChevronLeft,
  ChevronRight, Eye, Home, Building2, CheckCircle2
} from "lucide-react";

const SinglePropertyMap = dynamic(() => import("../../../components/map/SinglePropertyMap"), { ssr: false });

function formatPrice(price, listingType) {
  if (listingType === "rent" || listingType === "pg") {
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L/mo`;
    return `₹${price.toLocaleString("en-IN")}/mo`;
  }
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [saved, setSaved] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({ name: "", phone: "", message: "" });
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`/api/properties/${id}`);
        const data = await res.json();
        if (res.ok) setProperty(data.property);
        else router.push("/properties");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, router]);

  const handleEnquiry = async (e) => {
    e.preventDefault();
    setEnquiryLoading(true);
    try {
      await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...enquiryForm, propertyId: id }),
      });
      setEnquirySent(true);
    } finally {
      setEnquiryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <div className="h-96 bg-gray-200 rounded-2xl" />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>
            <div className="h-64 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const photos = property.photos || [];
  const owner = property.owner || {};

  const amenityIcons = {
    "Lift": "🛗", "Parking": "🅿️", "Gym": "🏋️", "Swimming Pool": "🏊",
    "Security": "🔒", "Power Backup": "⚡", "Club House": "🏛️",
    "Garden": "🌳", "CCTV": "📹", "Intercom": "📞",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-5 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/properties" className="hover:text-blue-600">Properties</Link>
          <span>/</span>
          <span className="text-gray-800 truncate">{property.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative h-80 sm:h-[420px]">
                {photos.length > 0 ? (
                  <>
                    <Image
                      src={photos[activePhoto]?.url}
                      alt={property.title}
                      fill
                      className="object-cover"
                      priority
                    />
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={() => setActivePhoto((p) => (p - 1 + photos.length) % photos.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setActivePhoto((p) => (p + 1) % photos.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                          {activePhoto + 1} / {photos.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-gray-300" />
                  </div>
                )}

                {/* Actions */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => setSaved(!saved)}
                    className="p-2 bg-white/90 rounded-full shadow hover:bg-white transition"
                  >
                    <Heart className={`w-4 h-4 ${saved ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                  </button>
                  <button className="p-2 bg-white/90 rounded-full shadow hover:bg-white transition">
                    <Share2 className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Thumbnail strip */}
              {photos.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {photos.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className={`relative w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${i === activePhoto ? "border-blue-500" : "border-transparent"
                        }`}
                    >
                      <Image src={photo.url} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${property.listingType === "buy" ? "bg-emerald-100 text-emerald-700" :
                      property.listingType === "rent" ? "bg-blue-100 text-blue-700" :
                        "bg-purple-100 text-purple-700"
                      }`}>
                      For {property.listingType?.toUpperCase()}
                    </span>
                    {property.isReraVerified && (
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> RERA Verified
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                  <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {[property.address?.locality, property.address?.city, property.address?.state].filter(Boolean).join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    {formatPrice(property.price, property.listingType)}
                  </p>
                  {property.views > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 justify-end">
                      <Eye className="w-3 h-3" /> {property.views} views
                    </p>
                  )}
                </div>
              </div>

              {/* Quick specs */}
              <div className="grid grid-cols-3 gap-3 py-4 border-y border-gray-100">
                {property.details?.bedrooms && (
                  <div className="text-center">
                    <BedDouble className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="font-semibold text-gray-800">{property.details.bedrooms} BHK</p>
                    <p className="text-xs text-gray-400">Bedrooms</p>
                  </div>
                )}
                {property.details?.bathrooms && (
                  <div className="text-center">
                    <Bath className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="font-semibold text-gray-800">{property.details.bathrooms}</p>
                    <p className="text-xs text-gray-400">Bathrooms</p>
                  </div>
                )}
                {property.details?.area && (
                  <div className="text-center">
                    <Maximize2 className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="font-semibold text-gray-800">{property.details.area}</p>
                    <p className="text-xs text-gray-400">sq.ft</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {property.description && (
                <div className="mt-5">
                  <h2 className="font-semibold text-gray-800 mb-2">About this property</h2>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {property.amenities?.length > 0 && (
                <div className="mt-5">
                  <h2 className="font-semibold text-gray-800 mb-3">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity) => (
                      <span key={amenity} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-sm text-gray-700">
                        <span>{amenityIcons[amenity] || "✓"}</span>
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Additional details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4">Property Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  ["Property Type", property.propertyType],
                  ["Floor", property.details?.floor ? `${property.details.floor}${property.details.totalFloors ? ` of ${property.details.totalFloors}` : ""}` : null],
                  ["Furnishing", property.details?.furnishing],
                  ["Status", property.details?.constructionStatus],
                  ["Facing", property.details?.facing],
                  ["Age", property.details?.ageOfProperty ? `${property.details.ageOfProperty} years` : null],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Section */}
            {property.location?.coordinates && property.location.coordinates.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-4">Location on Map</h2>
                <div className="h-[300px] w-full">
                  <SinglePropertyMap location={property.location} />
                </div>
              </div>
            )}
          </div>

          {/* Right — contact + enquiry */}
          <div className="space-y-4">
            {/* Owner/Agent card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-blue-100 flex-shrink-0">
                  {owner.avatar ? (
                    <Image src={owner.avatar} alt={owner.name} fill className="object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-lg">
                      {owner.name?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{owner.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{owner.agencyName || "Property Owner"}</p>
                </div>
              </div>

              {/* Trust score */}
              {property.trustScore && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 rounded-xl">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">Trust Score</span>
                      <span className="font-bold text-amber-600">{property.trustScore}%</span>
                    </div>
                    <div className="h-1.5 bg-amber-200 rounded-full">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${property.trustScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Enquiry form */}
              {enquirySent ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="font-semibold text-gray-800">Enquiry Sent!</p>
                  <p className="text-sm text-gray-500 mt-1">The owner will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleEnquiry} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    value={session?.user?.name || enquiryForm.name}
                    onChange={(e) => setEnquiryForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="I'm interested in this property..."
                    rows={3}
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm((p) => ({ ...p, message: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={enquiryLoading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-60"
                  >
                    {enquiryLoading ? "Sending..." : "Contact Owner"}
                  </button>
                </form>
              )}

              <div className="grid grid-cols-2 gap-2 mt-3">
                <div

                  href={`tel:${owner.phone}`}
                  className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <a>
                    <Phone className="w-4 h-4" /> Call
                  </a>
                </div>
                <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition">
                  <Calendar className="w-4 h-4" /> Visit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}