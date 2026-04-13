"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import {
  MapPin, BedDouble, Bath, Maximize2, BadgeCheck, Zap,
  Phone, Calendar, Share2, Heart, ChevronLeft,
  ChevronRight, Eye, Building2, CheckCircle2, MessageCircle
} from "lucide-react";
import ChatWindow from "../../../components/chat/ChatWindow";

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
  const [enquiryForm, setEnquiryForm] = useState({ name: "", email: "", phone: "", message: "", error: "" });
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setEnquiryForm(prev => ({
        ...prev,
        name: prev.name || session.user.name || "",
        email: prev.email || session.user.email || "",
      }));
    }
  }, [session]);

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
    setEnquiryForm(p => ({ ...p, error: "" }));

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: id,
          name: enquiryForm.name || session?.user?.name || "",
          email: enquiryForm.email || session?.user?.email || "",
          phone: enquiryForm.phone,
          message: enquiryForm.message,
          enquiryType: "general",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEnquirySent(true);
      } else {
        setEnquiryForm(p => ({ ...p, error: data.error || "Failed to send enquiry." }));
      }
    } catch {
      setEnquiryForm(p => ({ ...p, error: "Network error. Please try again." }));
    } finally {
      setEnquiryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] relative w-full">
        {/* Background Ambient Glow beneath content */}
        <div className="absolute top-0 left-0 w-125 h-125 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-6 relative z-10 animate-pulse">
          <div className="h-96 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div className="h-8 bg-white/10 rounded w-2/3" />
              <div className="h-4 bg-white/5 rounded w-1/3" />
            </div>
            <div className="h-64 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm" />
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
    <div className="min-h-screen bg-[#0b1120] relative w-full">
      {/* Background Ambient Glow beneath content */}
      <div className="absolute top-0 left-0 w-125 h-125 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-125 h-125 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 py-6 relative z-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-400 mb-5 flex items-center gap-2">
          <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/properties" className="hover:text-indigo-400 transition-colors">Properties</Link>
          <span>/</span>
          <span className="text-slate-200 truncate font-medium">{property.title}</span>
        </nav>

        {/* ── Bento-Box Photo Gallery (Full Width) ── */}
        <div className="relative w-full h-75 md:h-115 mb-8 rounded-3xl overflow-hidden flex gap-2 group shadow-[0_8px_30px_rgba(0,0,0,0.4)] bg-white/5 border border-white/10 backdrop-blur-sm">

          {/* Main Hero Photo (Left) */}
          <div className="relative w-full md:w-[65%] h-full cursor-pointer">
            {photos.length > 0 ? (
              <>
                <Image
                  src={photos[activePhoto]?.url}
                  alt={property.title}
                  fill
                  className="object-cover transition-transform duration-600 ease-out hover:scale-[1.03]"
                  priority
                />

                {/* Mobile Carousel Controls */}
                {photos.length > 1 && (
                  <div className="md:hidden">
                    <button
                      onClick={(e) => { e.stopPropagation(); setActivePhoto((p) => (p - 1 + photos.length) % photos.length); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-md hover:bg-black/60 text-white rounded-full transition border border-white/10"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActivePhoto((p) => (p + 1) % photos.length); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-md hover:bg-black/60 text-white rounded-full transition border border-white/10"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium tracking-wide border border-white/10">
                      {activePhoto + 1} / {photos.length}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/5">
                <Building2 className="w-16 h-16 text-slate-500" />
              </div>
            )}

            {/* Subtle overlay gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-[#0b1120] via-transparent to-transparent opacity-60 pointer-events-none" />

            {/* Overlaid Badges */}
            <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md border ${
                property.listingType === "buy" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                property.listingType === "rent" ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" :
                "bg-purple-500/20 text-purple-300 border-purple-500/30"
              }`}>
                For {property.listingType}
              </span>
              {property.isReraVerified && (
                <span className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                  <BadgeCheck size={14} /> RERA
                </span>
              )}
            </div>

            {/* Actions (Heart & Share) */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
                className="p-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full shadow-sm hover:bg-black/60 hover:border-white/20 transition-all duration-200"
              >
                <Heart className={`w-4 h-4 ${saved ? "fill-rose-500 text-rose-500" : "text-white"}`} />
              </button>
              <button className="p-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full shadow-sm hover:bg-black/60 hover:border-white/20 transition-all duration-200">
                <Share2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Right side: 2x2 Small Grid (Desktop Only) */}
          <div className="hidden md:grid grid-cols-2 grid-rows-2 w-[35%] h-full gap-2 bg-transparent">
            {[1, 2, 3, 4].map((gridIndex) => {
              const photo = photos[gridIndex];
              const isLast = gridIndex === 4;
              const hasMore = photos.length > 5;

              return (
                <div
                  key={gridIndex}
                  className="relative w-full h-full overflow-hidden group/thumb cursor-pointer bg-white/5"
                  onClick={() => { if (photo) setActivePhoto(gridIndex) }}
                >
                  {photo ? (
                    <Image
                      src={photo.url}
                      alt={`Gallery view ${gridIndex}`}
                      fill
                      className={`object-cover transition-transform duration-600 ${activePhoto === gridIndex ? "opacity-50 scale-105" : "group-hover/thumb:scale-110"}`}
                    />
                  ) : null}

                  {/* Dim overlay if active on hero to show selection */}
                  {activePhoto === gridIndex && photo && (
                    <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-[1px] ring-2 ring-inset ring-indigo-500 transition-all" />
                  )}

                  {/* "View All" overlay for last image block if there are >5 photos */}
                  {isLast && hasMore && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setActivePhoto(5); }}
                      className="absolute inset-0 bg-[#0b1120]/60 backdrop-blur-sm flex flex-col items-center justify-center hover:bg-[#0b1120]/80 transition-colors border border-white/10"
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
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-lg">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      property.listingType === "buy" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                      property.listingType === "rent" ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" :
                      "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    }`}>
                      For {property.listingType?.toUpperCase()}
                    </span>
                    {property.isReraVerified && (
                      <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <BadgeCheck className="w-3.5 h-3.5" /> RERA Verified
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{property.title}</h1>
                  <p className="text-slate-400 text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    {[property.address?.locality, property.address?.city, property.address?.state].filter(Boolean).join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                    {formatPrice(property.price, property.listingType)}
                  </p>
                  {property.views > 0 && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 justify-end font-medium">
                      <Eye className="w-3.5 h-3.5" /> {property.views} views
                    </p>
                  )}
                </div>
              </div>

              {/* Quick specs */}
              <div className="grid grid-cols-3 gap-3 py-6 border-y border-white/10">
                {property.details?.bedrooms && (
                  <div className="text-center">
                    <BedDouble className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                    <p className="font-semibold text-white text-lg">{property.details.bedrooms} BHK</p>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Bedrooms</p>
                  </div>
                )}
                {property.details?.bathrooms && (
                  <div className="text-center">
                    <Bath className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                    <p className="font-semibold text-white text-lg">{property.details.bathrooms}</p>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Bathrooms</p>
                  </div>
                )}
                {property.details?.area && (
                  <div className="text-center">
                    <Maximize2 className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                    <p className="font-semibold text-white text-lg">{property.details.area}</p>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">sq.ft</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {property.description && (
                <div className="mt-8">
                  <h2 className="font-bold text-white text-lg mb-3">About this property</h2>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {property.amenities?.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-bold text-white text-lg mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-2.5">
                    {property.amenities.map((amenity) => (
                      <span key={amenity} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 hover:border-white/20 transition-colors">
                        <span className="opacity-80">{amenityIcons[amenity] || "✓"}</span>
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Additional details */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-lg">
              <h2 className="font-bold text-white text-lg mb-6">Property Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  ["Property Type", property.propertyType],
                  ["Floor", property.details?.floor ? `${property.details.floor}${property.details.totalFloors ? ` of ${property.details.totalFloors}` : ""}` : null],
                  ["Furnishing", property.details?.furnishing],
                  ["Status", property.details?.constructionStatus],
                  ["Facing", property.details?.facing],
                  ["Age", property.details?.ageOfProperty ? `${property.details.ageOfProperty} years` : null],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm font-semibold text-white capitalize">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Section */}
            {property.location?.coordinates && property.location.coordinates.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-lg">
                <h2 className="font-bold text-white text-lg mb-6">Location on Map</h2>
                <div className="h-87.5 w-full rounded-2xl overflow-hidden border border-white/10">
                  <SinglePropertyMap location={property.location} />
                </div>
              </div>
            )}
          </div>

          {/* Right ── contact + enquiry (Sticky) */}
          <div className="space-y-6 lg:sticky lg:top-24 h-fit">
            {/* Owner/Agent card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-lg">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-indigo-500/20 border border-indigo-500/30 shrink-0">
                  {owner.avatar ? (
                    <Image src={owner.avatar} alt={owner.name} fill className="object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-indigo-400 font-bold text-xl">
                      {owner.name?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-white text-lg">{owner.name}</p>
                  <p className="text-sm font-medium text-slate-400 capitalize">{owner.agencyName || "Property Owner"}</p>
                </div>
              </div>

              {/* Trust score */}
              {property.trustScore && (
                <div className="flex items-center gap-3 mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-300">Trust Score</span>
                      <span className="font-bold text-amber-400">{property.trustScore}%</span>
                    </div>
                    <div className="h-1.5 bg-amber-500/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                        style={{ width: `${property.trustScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Enquiry form */}
              {enquirySent ? (
                <div className="text-center py-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
                  <p className="font-bold text-white text-lg">Enquiry Sent!</p>
                  <p className="text-sm text-slate-400 mt-2 font-medium">The owner will contact you shortly.</p>
                </div>
              ) : (
                  <form onSubmit={handleEnquiry} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Your Name *"
                      required
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                    />
                    <input
                      type="email"
                      placeholder="Email Address *"
                      required
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      required
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                    />
                    <textarea
                      placeholder="I'm interested in this property..."
                      rows={3}
                      value={enquiryForm.message}
                      onChange={(e) => setEnquiryForm(p => ({ ...p, message: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner resize-none"
                    />
                    {enquiryForm.error && (
                      <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                        {enquiryForm.error}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={enquiryLoading}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] disabled:opacity-60"
                    >
                      {enquiryLoading ? "Sending..." : "Contact Owner"}
                    </button>
                  </form>
              )}

              <div className="grid grid-cols-2 gap-3 mt-4">
                <a
                  href={`tel:${owner.phone}`}
                  className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <Phone className="w-4 h-4 text-indigo-400" /> Call
                </a>
                <button className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all">
                  <Calendar className="w-4 h-4 text-indigo-400" /> Visit
                </button>
              </div>

              {/* Chat with Owner */}
              {session && owner._id && session.user.id !== owner._id?.toString() && (
                <button
                  onClick={() => setShowChat(true)}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl text-sm font-semibold text-indigo-300 hover:text-indigo-200 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat with Owner
                </button>
              )}

            </div>
          </div>
        </div>
        {/* floating chat window */}
        {showChat && (
          <ChatWindow
            propertyId={id}
            onClose={() => setShowChat(false)}
          />
        )}

      </div>
    </div >
  );
}
