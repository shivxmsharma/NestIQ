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


const LocationMap = dynamic(() => import('../../../components/map/LocationPicker'));

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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted ? "bg-emerald-500 text-white" :
                isActive ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                  "bg-gray-100 text-gray-400"
                }`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className="text-xs font-medium text-gray-600 hidden sm:block">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 sm:w-20 h-0.5 mx-2 mb-5 transition-colors ${step.id < current ? "bg-emerald-400" : "bg-gray-200"}`} />
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

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  if (!session) {
    router.push("/auth/login?callbackUrl=/dashboard/list-property");
    return null;
  }

  const allowedRoles = ["seller", "broker", "admin"];
  if (!allowedRoles.includes(session.user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-sm border">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sellers & Brokers Only</h2>
          <p className="text-gray-500 mb-6">You need a Seller or Broker account to list properties.</p>
          <button onClick={() => router.push("/")} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition">
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

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">List Your Property</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the details to get your property noticed</p>
        </div>

        <StepIndicator steps={STEPS} current={step} />

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Step card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

          {/* STEP 1 — Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>

              {/* Listing type */}
              <div>
                <label className={labelClass}>I want to</label>
                <div className="flex gap-3">
                  {LISTING_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField("listingType", type)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold capitalize transition ${form.listingType === type
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField("propertyType", type)}
                      className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition ${form.propertyType === type
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
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
                <p className="text-xs text-gray-400 mt-1">{form.title.length}/100</p>
              </div>

              {/* Price */}
              <div>
                <label className={labelClass}>
                  {form.listingType === "buy" ? "Sale Price (₹) *" : "Monthly Rent (₹) *"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <input
                    type="number"
                    placeholder={form.listingType === "buy" ? "e.g. 7500000" : "e.g. 25000"}
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    className={`${inputClass} pl-8`}
                    min="0"
                  />
                </div>
                {form.price && !isNaN(form.price) && (
                  <p className="text-xs text-blue-600 mt-1 font-medium">
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
                  rows={4}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className={`${inputClass} resize-none`}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-400 mt-1">{form.description.length}/1000</p>
              </div>
            </div>
          )}

          {/* STEP 2 — Location */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-800">Location Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {/* Under the City/State inputs in Step 2 */}
                <div className="sm:col-span-2 mt-4 space-y-2">
                  <label className={labelClass}>Pin on Map</label>
                  <p className="text-xs text-gray-500 mb-2">Click exactly where the property is located to make it searchable on the map.</p>
                  <LocationMap
                    location={form.location}
                    setLocation={(loc) => setForm(prev => ({ ...prev, location: loc }))}
                    scrollWheelZoom={false}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Details & Amenities */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-800">Property Details</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
              <div>
                <label className={labelClass}>Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition ${form.amenities.includes(amenity)
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
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
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Property Photos</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Listings with 5+ photos get <span className="font-semibold text-blue-600">3x more enquiries</span>. Add your best shots first — it becomes the cover.
                </p>
              </div>
              <ImageUpload
                images={form.photos}
                onChange={(photos) => updateField("photos", photos)}
                maxImages={10}
              />
            </div>
          )}

        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-5">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-0 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < STEPS.length ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition disabled:opacity-60"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Publish Listing</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}