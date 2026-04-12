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
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-6">
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
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-5 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/properties" className="hover:text-blue-600">Properties</Link>
          <span>/</span>
          <span className="text-gray-800 truncate">{property.title}</span>
        </nav>

        {/* ── Bento-Box Photo Gallery (Full Width) ── */}
        <div className="relative w-full h-[300px] md:h-[460px] mb-8 rounded-3xl overflow-hidden flex gap-2 group shadow-sm bg-slate-100">

          {/* Main Hero Photo (Left) */}
          <div className="relative w-full md:w-[65%] h-full cursor-pointer">
            {photos.length > 0 ? (
              <>
                <Image
                  src={photos[activePhoto]?.url}
                  alt={property.title}
                  fill
                  className="object-cover transition-transform duration-[600ms] ease-out hover:scale-[1.03]"
                  priority
                />

                {/* Mobile Carousel Controls */}
                {photos.length > 1 && (
                  <div className="md:hidden">
                    <button
                      onClick={(e) => { e.stopPropagation(); setActivePhoto((p) => (p - 1 + photos.length) % photos.length); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-md hover:bg-black/60 text-white rounded-full transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActivePhoto((p) => (p + 1) % photos.length); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-md hover:bg-black/60 text-white rounded-full transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium tracking-wide">
                      {activePhoto + 1} / {photos.length}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-slate-300" />
              </div>
            )}

            {/* Overlaid Badges */}
            <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md ${property.listingType === "buy" ? "bg-emerald-600/90 text-white" :
                  property.listingType === "rent" ? "bg-blue-600/90 text-white" :
                    "bg-purple-600/90 text-white"
                }`}>
                For {property.listingType}
              </span>
              {property.isReraVerified && (
                <span className="bg-white/90 backdrop-blur-md text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                  <BadgeCheck className="w-3.5 h-3.5" /> RERA
                </span>
              )}
            </div>

            {/* Actions (Heart & Share) */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
                className="p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm hover:bg-white hover:scale-110 active:scale-90 transition-all duration-200"
              >
                <Heart className={`w-4 h-4 ${saved ? "fill-rose-500 text-rose-500" : "text-slate-600"}`} />
              </button>
              <button className="p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm hover:bg-white hover:scale-110 active:scale-90 transition-all duration-200">
                <Share2 className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Right side: 2x2 Small Grid (Desktop Only) */}
          <div className="hidden md:grid grid-cols-2 grid-rows-2 w-[35%] h-full gap-2">
            {[1, 2, 3, 4].map((gridIndex) => {
              const photo = photos[gridIndex];
              const isLast = gridIndex === 4;
              const hasMore = photos.length > 5;

              return (
                <div
                  key={gridIndex}
                  className="relative w-full h-full overflow-hidden group/thumb cursor-pointer bg-slate-200"
                  onClick={() => { if (photo) setActivePhoto(gridIndex) }}
                >
                  {photo ? (
                    <Image
                      src={photo.url}
                      alt={`Gallery view ${gridIndex}`}
                      fill
                      className={`object-cover transition-transform duration-[600ms] ${activePhoto === gridIndex ? 'opacity-50 scale-105' : 'group-hover/thumb:scale-110'}`}
                    />
                  ) : null}

                  {/* Dim overlay if active on hero to show selection */}
                  {activePhoto === gridIndex && photo && (
                    <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-[1px] ring-2 ring-inset ring-indigo-500 transition-all" />
                  )}

                  {/* "View All" overlay for last image block if there are >5 photos */}
                  {isLast && hasMore && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setActivePhoto(5); }}
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center hover:bg-black/60 transition-colors"
                    >
                      <Maximize2 className="w-6 h-6 text-white mb-1" />
                      <span className="text-white font-medium text-sm tracking-wide">
                        View all {photos.length} photos
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Main Layout Split ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — content column */}
          <div className="lg:col-span-2 space-y-6">

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

          {/* Right ── contact + enquiry (Sticky) */}
          <div className="space-y-4 lg:sticky lg:top-24 h-fit">
            {/* Owner/Agent card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
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
