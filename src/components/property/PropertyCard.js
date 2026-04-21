import Link from "next/link";
import Image from "next/image";
import { MapPin, BedDouble, Bath, Maximize2, Heart, BadgeCheck, Zap, Eye } from "lucide-react";
import TrustBadge from "./TrustBadge";

function formatPrice(price, listingType) {
  if (listingType === "rent" || listingType === "pg") {
    if (price >= 100000) return `₹${(price / 10000).toFixed(1)}L/mo`;
    return `₹${price.toLocaleString("en-IN")}/mo`;    // ← fix: was ₹$
  }
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function PropertyCard({ property, saved = false, onSave, variant = "light" }) {
  const coverImage = property.photos?.[0]?.url || "/placeholder-property.jpg";
  const { _id, title, listingType, propertyType, price, address, details, isReraVerified, trustScore, views } = property;

  const listingColors = {
    buy: "bg-emerald-600",
    rent: "bg-indigo-600",
    pg: "bg-violet-600",
  };

  const isDark = variant === "dark";

  return (
    <Link href={`/properties/${_id}`} className="group block h-full">
      <div className={`${isDark ? "bg-[#0b1120]/60 border-white/10" : "bg-white border-slate-200"} rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col backdrop-blur-md`}>

        {/* ── Image ── */}
        <div className="relative h-52 overflow-hidden shrink-0">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-600 ease-out"
          />

          {/* Badges top-left */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <span className={`${listingColors[listingType] || "bg-gray-600"} text-white text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md`}>
              {listingType === "pg" ? "PG" : listingType}
            </span>
            {isReraVerified && (
              <span className="bg-white/90 backdrop-blur-md text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <BadgeCheck className="w-3 h-3" /> RERA
              </span>
            )}
          </div>

          {/* Save button */}
          {onSave && (
            <button
              onClick={(e) => { e.preventDefault(); onSave(_id); }}
              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-sm transition-all hover:scale-110 active:scale-90 duration-200"
            >
              <Heart className={`w-4 h-4 transition-colors ${saved ? "fill-rose-500 text-rose-500" : "text-slate-500"}`} />
            </button>
          )}

          {/* Trust score */}
          {trustScore >= 80 && (
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Zap className="w-3 h-3 text-amber-400" />
              Trust {trustScore}%
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="p-4 flex flex-col flex-1">

          {/* Title + location — top section */}
          <div>
            <h3 className={`font-semibold text-sm leading-snug line-clamp-2 mb-1.5 ${isDark ? "text-white group-hover:text-indigo-400 transition-colors" : "text-slate-800"}`}>
              {title}
            </h3>
            <p className={`text-xs font-medium flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              <MapPin className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-indigo-400" : "text-slate-400"}`} />
              <span className="line-clamp-1">
                {address?.locality && `${address.locality}, `}{address?.city}
              </span>
            </p>
          </div>

          {/* Spacer — pushes specs + price to bottom */}
          <div className="flex-1" />

          {/* ── Specs row ── */}
          {(details?.bedrooms || details?.bathrooms || details?.area) && (
            <div className={`flex items-center gap-3 py-3 border-t mt-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
              {details?.bedrooms && (
                <span className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  <BedDouble className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-indigo-400" : "text-slate-400"}`} />
                  {details.bedrooms} {details.bedrooms === 1 ? "Bed" : "Beds"}
                </span>
              )}
              {details?.bathrooms && (
                <span className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  <Bath className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-indigo-400" : "text-slate-400"}`} />
                  {details.bathrooms} {details.bathrooms === 1 ? "Bath" : "Baths"}
                </span>
              )}
              {details?.area && (
                <span className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  <Maximize2 className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-indigo-400" : "text-slate-400"}`} />
                  {details.area} sq.ft
                </span>
              )}
            </div>
          )}

          {/* ── Price + View button ── */}
          <div className={`flex flex-col gap-3 pt-3 border-t ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                    {formatPrice(price, listingType)}
                  </span>
                  {trustScore && <TrustBadge score={trustScore} size="sm" />}
                </div>
                {views > 0 && (
                  <span className={`flex items-center gap-1 text-xs font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>
                    <Eye className="w-3.5 h-3.5" /> {views} views
                  </span>
                )}
              </div>
              <span className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 ${isDark ? "bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-indigo-500" : "bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white"}`}>
                View
              </span>
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}