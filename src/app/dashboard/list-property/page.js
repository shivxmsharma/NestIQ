"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ImageUpload from "../../../components/property/ImageUpload";
import {
  Home, MapPin, List, Image as ImageIcon,
  CheckCircle2, ChevronRight, ChevronLeft, Loader2, AlertCircle
} from "lucide-react";
import dynamic from "next/dynamic";


const LocationMap = dynamic(() => import('../../../components/map/LocationPicker'), { ssr: false });

const LISTING_TYPES = ["buy", "rent", "pg"];
const PROPERTY_TYPES = ["Apartment", "Villa", "Independent House", "Plot", "Studio", "Penthouse", "Builder Floor"];
const FURNISHING_OPTIONS = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];
const CONSTRUCTION_STATUS = ["Under Construction", "Ready to Move"];
const FACING_OPTIONS = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];
const AMENITIES = ["Lift", "Parking", "Gym", "Swimming Pool", "Security", "Power Backup", "Club House", "Garden", "CCTV", "Intercom", "Kids Play Area", "24x7 Water Supply"];

const STEPS = [
  { id: 1, label: "Basic Info", icon: Home },
  { id: 2, label: "Location", icon: MapPin },
  { id: 3, label: "Details", icon: List },
  { id: 4, label: "Photos", icon: ImageIcon },
];

const initialForm = {
  title: "",
  description: "",
  listingType: "buy",
  propertyType: "Apartment",
  price: "",
  address: { street: "", locality: "", city: "Chandigarh", state: "Chandigarh", pincode: "" },
  location: { lat: 30.7333, lng: 76.7794 },
  details: {
    bedrooms: "", bathrooms: "", area: "", floor: "", totalFloors: "",
    furnishing: "", constructionStatus: "", facing: "", ageOfProperty: "",
  },
  amenities: [],
  photos: [],
};

function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isCompleted = step.id < current;
        const isActive = step.id === current;
        return (
          <div key={step.id} className="flex items-center">
            <div className={`flex flex-col items-center gap-1.5 ${isCompleted || isActive ? "opacity-100" : "opacity-40"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" :
                isActive ? "bg-indigo-600 text-white ring-4 ring-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.4)]" :
                  "bg-white/5 border border-white/10 text-slate-500"
                }`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className="text-xs font-bold tracking-wide text-slate-300 hidden sm:block">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 sm:w-20 h-[2px] mx-2 mb-5 transition-colors ${step.id < current ? "bg-emerald-500/50" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ListPropertyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") return <div className="min-h-screen bg-[#0b1120] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  if (!session) {
    router.push("/auth/login?callbackUrl=/dashboard/list-property");
    return null;
  }

  const allowedRoles = ["seller", "broker", "admin"];
  if (!allowedRoles.includes(session.user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1120] relative overflow-hidden z-10 w-full px-4">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md text-center shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative z-10">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Sellers & Brokers Only</h2>
          <p className="text-slate-400 mb-8 font-medium">You need a Seller or Broker account to list properties.</p>
          <button onClick={() => router.push("/")} className="px-6 py-3 bg-indigo-600 w-full text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const updateField = (path, value) => {
    setForm((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let ref = next;
      for (let i = 0; i < keys.length - 1; i++) {
        ref[keys[i]] = { ...ref[keys[i]] };
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.title.trim()) return "Property title is required";
      if (!form.price || isNaN(form.price) || form.price <= 0) return "Valid price is required";
      if (!form.listingType) return "Listing type is required";
    }
    if (step === 2) {
      if (!form.address.locality.trim()) return "Locality is required";
      if (!form.address.city.trim()) return "City is required";
    }
    if (step === 4) {
      if (form.photos.length === 0) return "At least 1 photo is required";
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const prevStep = () => { setError(""); setStep((s) => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...form,
        location: {
          type: "Point",
          coordinates: [form.location.lng, form.location.lat]
        },
        price: parseInt(form.price),
        details: {
          ...form.details,
          bedrooms: form.details.bedrooms ? parseInt(form.details.bedrooms) : undefined,
          bathrooms: form.details.bathrooms ? parseInt(form.details.bathrooms) : undefined,
          area: form.details.area ? parseInt(form.details.area) : undefined,
          floor: form.details.floor ? parseInt(form.details.floor) : undefined,
          totalFloors: form.details.totalFloors ? parseInt(form.details.totalFloors) : undefined,
          ageOfProperty: form.details.ageOfProperty ? parseInt(form.details.ageOfProperty) : undefined,
        },
      };

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/properties/${data.property._id}?listed=true`);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner [&>option]:bg-[#0b1120] [&>option]:text-white";
  const labelClass = "block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2";

  return (
    <div className="min-h-screen bg-[#0b1120] relative z-10 w-full py-8 overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">List Your Property</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Fill in the details to get your property noticed</p>
        </div>

        <StepIndicator steps={STEPS} current={step} />

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2 font-medium shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Step card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-6 sm:p-8">

          {/* STEP 1 — Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-2">Basic Information</h2>

              {/* Listing type */}
              <div>
                <label className={labelClass}>I want to</label>
                <div className="flex gap-3">
                  {LISTING_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField("listingType", type)}
                      className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold capitalize transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${form.listingType === type
                        ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-300"
                        : "border-white/5 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                        }`}
                    >
                      {type === "pg" ? "List PG" : `${type.charAt(0).toUpperCase() + type.slice(1)}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property type */}
              <div>
                <label className={labelClass}>Property Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField("propertyType", type)}
                      className={`py-2.5 px-3 rounded-xl border-2 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${form.propertyType === type
                        ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-300"
                        : "border-white/5 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className={labelClass}>Property Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Spacious 3BHK in Sector 22, Chandigarh"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className={inputClass}
                  maxLength={100}
                />
                <p className="text-xs font-medium text-slate-500 mt-2 text-right">{form.title.length}/100</p>
              </div>

              {/* Price */}
              <div>
                <label className={labelClass}>
                  {form.listingType === "buy" ? "Sale Price (₹) *" : "Monthly Rent (₹) *"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    placeholder={form.listingType === "buy" ? "e.g. 7500000" : "e.g. 25000"}
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    className={`${inputClass} pl-9`}
                    min="0"
                  />
                </div>
                {form.price && !isNaN(form.price) && (
                  <p className="text-sm text-indigo-400 mt-2 font-bold tracking-wide">
                    {parseInt(form.price) >= 10000000
                      ? `₹${(form.price / 10000000).toFixed(2)} Crore`
                      : parseInt(form.price) >= 100000
                        ? `₹${(form.price / 100000).toFixed(1)} Lakh`
                        : `₹${parseInt(form.price).toLocaleString("en-IN")}`}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  placeholder="Describe the property — highlight key features, nearby landmarks, owner's note..."
                  rows={5}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className={`${inputClass} resize-none`}
                  maxLength={1000}
                />
                <p className="text-xs font-medium text-slate-500 mt-2 text-right">{form.description.length}/1000</p>
              </div>
            </div>
          )}

          {/* STEP 2 — Location */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-2">Location Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Street Address</label>
                  <input
                    type="text"
                    placeholder="House/Flat No, Street, Building Name"
                    value={form.address.street}
                    onChange={(e) => updateField("address.street", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Locality / Area *</label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 22, Mohali Phase 5"
                    value={form.address.locality}
                    onChange={(e) => updateField("address.locality", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>City *</label>
                  <input
                    type="text"
                    placeholder="e.g. Chandigarh"
                    value={form.address.city}
                    onChange={(e) => updateField("address.city", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>State</label>
                  <input
                    type="text"
                    placeholder="e.g. Punjab"
                    value={form.address.state}
                    onChange={(e) => updateField("address.state", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Pincode</label>
                  <input
                    type="text"
                    placeholder="e.g. 160022"
                    value={form.address.pincode}
                    onChange={(e) => updateField("address.pincode", e.target.value)}
                    className={inputClass}
                    maxLength={6}
                  />
                </div>
                {/* Map Pitch */}
                <div className="sm:col-span-2 mt-4 space-y-3">
                  <label className={labelClass}>Pin on Map</label>
                  <p className="text-sm font-medium text-slate-400 mb-3">Click exactly where the property is located to make it searchable on the map.</p>
                  <div className="rounded-2xl overflow-hidden border border-white/10 ring-4 ring-indigo-500/10">
                    <LocationMap
                      location={form.location}
                      setLocation={(loc) => setForm(prev => ({ ...prev, location: loc }))}
                      scrollWheelZoom={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Details & Amenities */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-2">Property Details</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 border-b border-white/10 pb-8">
                {form.propertyType !== "Plot" && (
                  <>
                    <div>
                      <label className={labelClass}>Bedrooms</label>
                      <select value={form.details.bedrooms} onChange={(e) => updateField("details.bedrooms", e.target.value)} className={inputClass}>
                        <option value="">Select</option>
                        {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} BHK</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Bathrooms</label>
                      <select value={form.details.bathrooms} onChange={(e) => updateField("details.bathrooms", e.target.value)} className={inputClass}>
                        <option value="">Select</option>
                        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className={labelClass}>Area (sq.ft)</label>
                  <input type="number" placeholder="e.g. 1250" value={form.details.area} onChange={(e) => updateField("details.area", e.target.value)} className={inputClass} min="0" />
                </div>

                {form.propertyType !== "Plot" && (
                  <>
                    <div>
                      <label className={labelClass}>Floor No.</label>
                      <input type="number" placeholder="e.g. 3" value={form.details.floor} onChange={(e) => updateField("details.floor", e.target.value)} className={inputClass} min="0" />
                    </div>
                    <div>
                      <label className={labelClass}>Total Floors</label>
                      <input type="number" placeholder="e.g. 10" value={form.details.totalFloors} onChange={(e) => updateField("details.totalFloors", e.target.value)} className={inputClass} min="0" />
                    </div>
                    <div>
                      <label className={labelClass}>Furnishing</label>
                      <select value={form.details.furnishing} onChange={(e) => updateField("details.furnishing", e.target.value)} className={inputClass}>
                        <option value="">Select</option>
                        {FURNISHING_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Status</label>
                      <select value={form.details.constructionStatus} onChange={(e) => updateField("details.constructionStatus", e.target.value)} className={inputClass}>
                        <option value="">Select</option>
                        {CONSTRUCTION_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Facing</label>
                      <select value={form.details.facing} onChange={(e) => updateField("details.facing", e.target.value)} className={inputClass}>
                        <option value="">Select</option>
                        {FACING_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Age (years)</label>
                      <input type="number" placeholder="e.g. 5" value={form.details.ageOfProperty} onChange={(e) => updateField("details.ageOfProperty", e.target.value)} className={inputClass} min="0" />
                    </div>
                  </>
                )}
              </div>

              {/* Amenities */}
              <div className="pt-4">
                <label className={labelClass}>Amenities</label>
                <div className="flex flex-wrap gap-3">
                  {AMENITIES.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${form.amenities.includes(amenity)
                        ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-300 shadow-[0_0_10px_rgba(79,70,229,0.2)]"
                        : "border-white/5 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                        }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — Photos */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Property Photos</h2>
                <p className="text-sm font-medium text-slate-400 mt-1">
                  Listings with 5+ photos get <span className="font-bold text-indigo-400">3x more enquiries</span>. Add your best shots first — it becomes the cover.
                </p>
              </div>
              <div className="p-1">
                <ImageUpload
                  images={form.photos}
                  onChange={(photos) => updateField("photos", photos)}
                  maxImages={10}
                />
              </div>
            </div>
          )}

        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-bold hover:bg-white/10 hover:text-white hover:border-white/20 disabled:opacity-0 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>

          {step < STEPS.length ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0b1120]"
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:opacity-60 disabled:hover:shadow-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#0b1120]"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Publishing...</>
              ) : (
                <><CheckCircle2 className="w-5 h-5" /> Publish Listing</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
