import Link from "next/link";
import Image from "next/image";
import { MapPin, BedDouble, Bath, Maximize2, Heart, BadgeCheck, Zap, Eye } from "lucide-react";

function formatPrice(price, listingType) {
  if (listingType === "rent" || listingType === "pg") {
    if (price >= 100000) return `₹${(price / 10000).toFixed(1)}L/mo`;
    return `₹$${price.toLocaleString("en-IN")}/mo`;
  }
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function PropertyCard({ property, saved = false, onSave }) {
  const coverImage = property.photos?.[0]?.url || "/placeholder-property.jpg";
  const { _id, title, listingType, propertyType, price, address, details, isReraVerified, trustScore, views } = property;

  const listingColors = {
    buy: "bg-emerald-600",
    rent: "bg-indigo-600",
    pg: "bg-violet-600",
  };

  return (
    <Link href={`/properties/${_id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges top-left */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <span className={`${listingColors[listingType] || "bg-gray-600"} text-white text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full`}>
              {listingType === "pg" ? "PG" : listingType}
            </span>
            {isReraVerified && (
              <span className="bg-white/95 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" /> RERA
              </span>
            )}
          </div>

          {/* Save button top-right */}
          {onSave && (
            <button
              onClick={(e) => { e.preventDefault(); onSave(_id); }}
              className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow transition-all"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${saved ? "fill-red-500 text-red-500" : "text-gray-500"}`}
              />
            </button>
          )}

          {/* Trust score */}
          {trustScore >= 80 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-400" />
              Trust {trustScore}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price */}
          <div className="flex items-start justify-between mb-2">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(price, listingType)}
            </span>
            {views > 0 && (
              <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <Eye className="w-3 h-3" /> {views}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 mb-2">
            {title}
          </h3>

          {/* Location */}
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span className="truncate">
              {address?.locality && `${address.locality}, `}{address?.city}
            </span>
          </p>

          {/* Specs */}
          {(details?.bedrooms || details?.bathrooms || details?.area) && (
            <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
              {details?.bedrooms && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                  {details.bedrooms} {details.bedrooms === 1 ? "Bed" : "Beds"}
                </span>
              )}
              {details?.bathrooms && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <Bath className="w-3.5 h-3.5 text-slate-400" />
                  {details.bathrooms} {details.bathrooms === 1 ? "Bath" : "Baths"}
                </span>
              )}
              {details?.area && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                  {details.area} sq.ft
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}