export function calculateTrustScore(property, owner = {}) {
  let score = 0;

  // Photos — 4 pts each, max 20
  score += Math.min((property.photos?.length || 0) * 4, 20);

  // Amenities — 2 pts each, max 10
  score += Math.min((property.amenities?.length || 0) * 2, 10);

  // Address completeness — max 15
  if (property.address?.locality) score += 5;
  if (property.address?.city) score += 5;
  if (property.address?.pincode) score += 5;

  // Price set — 5 pts
  if (property.price > 0) score += 5;

  // Property details — max 15
  const d = property.details || {};
  if (d.bedrooms) score += 3;
  if (d.bathrooms) score += 3;
  if (d.area) score += 3;
  if (d.furnishing) score += 3;
  if (d.constructionStatus) score += 3;

  // Owner verified phone — 10 pts
  if (owner?.phone) score += 10;
  // Platform-verified owner — 10 pts
  if (owner?.isVerified) score += 10;

  // RERA verified — 15 pts
  if (property.isReraVerified) score += 15;

  return Math.min(score, 100);
}

export function getTrustMeta(score) {
  if (score >= 80) return { label: "Highly Trusted", color: "emerald" };
  if (score >= 60) return { label: "Verified", color: "blue" };
  if (score >= 40) return { label: "Moderate", color: "amber" };
  return { label: "Unverified", color: "red" };
}