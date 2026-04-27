"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Building2, ImageOff, User } from "lucide-react";

const ALLOWED_REMOTE_HOSTS = new Set([
  "res.cloudinary.com",
  "lh3.googleusercontent.com",
  "images.unsplash.com",
]);

function getSafeSrc(src) {
  if (!src || typeof src !== "string") return null;

  const trimmed = src.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return null;
    return ALLOWED_REMOTE_HOSTS.has(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

function FallbackIcon({ type }) {
  if (type === "avatar") return <User className="h-1/2 max-h-8 w-1/2 max-w-8" />;
  if (type === "property") return <Building2 className="h-1/2 max-h-12 w-1/2 max-w-12" />;
  return <ImageOff className="h-1/2 max-h-10 w-1/2 max-w-10" />;
}

export default function SafeImage({
  src,
  alt = "",
  className = "",
  fallbackType = "image",
  fallbackClassName = "",
  priority,
  preload,
  width,
  height,
  fill,
  ...props
}) {
  const safeSrc = useMemo(() => getSafeSrc(src), [src]);
  const [failedSrc, setFailedSrc] = useState(null);
  const hasFailed = failedSrc === safeSrc;

  if (!safeSrc || hasFailed) {
    return (
      <div
        aria-label={alt || "Image unavailable"}
        className={`${fill ? "absolute inset-0 h-full w-full" : ""} flex items-center justify-center bg-slate-100 text-slate-400 ${className} ${fallbackClassName}`}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <FallbackIcon type={fallbackType} />
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={safeSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      preload={preload ?? priority}
      className={className}
      onError={() => setFailedSrc(safeSrc)}
    />
  );
}
