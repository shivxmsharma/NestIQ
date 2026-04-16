"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Camera, User, Phone, CheckCircle2, XCircle, ShieldCheck, Mail, Loader2, Link as LinkIcon, Save, Settings, Briefcase, Edit2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Add picture upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Status message
  const [statusMsg, setStatusMsg] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setOriginalProfile(data.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
    setStatusMsg("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone || "",
          agencyName: profile.agencyName || "",
          reraId: profile.reraId || "",
          avatar: profile.avatar || "",
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatusMsg("Profile successfully updated!");
        setOriginalProfile(data.user);
        setIsEditing(false);
        // Update NextAuth session
        if (session) {
          await update({
            ...session,
            user: {
              ...session.user,
              name: profile.name,
              avatar: profile.avatar
            }
          });
        }
      } else {
        setStatusMsg(data.error || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("Something went wrong.");
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMsg(""), 5000);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("Cloudinary not configured completely.");
      setUploadingAvatar(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "nestiq/avatars");

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Avatar upload failed");
      const uploadData = await res.json();

      setProfile(prev => ({ ...prev, avatar: uploadData.secure_url }));

      // Auto save avatar
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: uploadData.secure_url }),
      });

      await update({
        ...session,
        user: { ...session.user, avatar: uploadData.secure_url }
      });

    } catch (error) {
      console.error(error);
      alert("Failed to upload image.");
    } finally {
      setUploadingAvatar(false);
      e.target.value = null; // reset input
    }
  };


  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0b1120] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0b1120] flex items-center justify-center text-white">
        <h2>Please log in to view this page.</h2>
      </div>
    );
  }

  const isProfessional = ["broker", "seller"].includes(profile.role);

  return (
    <div className="text-slate-300">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Account Settings</h1>
      </div>

      {statusMsg && (
        <div className={`mb-6 p-4 rounded-2xl ${statusMsg.includes("failed") || statusMsg.includes("wrong") ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
          {statusMsg}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8 items-start">

        {/* LEFT: Identity Card (Sticky) */}
        <div className="lg:col-span-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)] sticky top-6">
          <div className="h-32 bg-linear-to-r from-indigo-500/40 via-purple-500/40 to-[#111827]/80 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 Mix-blend-overlay"></div>
          </div>

          <div className="flex flex-col items-center px-8 pb-8 -mt-16">

            {/* Avatar */}
            <div className="relative group mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-indigo-900 border-4 border-[#111827] shadow-xl relative">
                {profile.avatar ? (
                  <Image src={profile.avatar} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-500/20 text-indigo-300 text-4xl font-bold">
                    {profile.name?.[0]?.toUpperCase()}
                  </div>
                )}

                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}

                {/* Hover Upload Overlay */}
                {!uploadingAvatar && isEditing && (
                  <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-6 h-6 text-white mb-1" />
                    <span className="text-xs font-semibold text-white">Change</span>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      name="avatar"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Info */}
            <h2 className="text-2xl font-bold text-white mb-1">{profile.name}</h2>
            <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-4 bg-slate-800/50 px-3 py-1 rounded-full">
              <Mail className="w-3.5 h-3.5" />
              {profile.email}
            </div>

            {/* Role Badge */}
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 shadow-lg ${profile.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              profile.role === 'broker' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                profile.role === 'seller' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
              {profile.role === 'buyer' ? 'Home Buyer' : profile.role}
            </div>

            {/* Verification Checklist */}
            <div className="w-full space-y-4 pt-6 border-t border-white/10 bg-white/5 -mx-8 px-8 pb-4 mt-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Trust & Safety</h3>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4" /> Email
                </span>
                {profile.email ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-slate-500" />}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-4 h-4" /> Mobile
                </span>
                {profile.phone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-slate-500" />}
              </div>

              {isProfessional && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-300">
                    <ShieldCheck className="w-4 h-4" /> RERA Verified
                  </span>
                  {profile.reraId ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-slate-500" />}
                </div>
              )}
            </div>

          </div>
        </div>


        {/* RIGHT: Settings Modules */}
        <div className="lg:col-span-8 space-y-10">
          <form onSubmit={handleSave} className="space-y-10">

            {/* Personal Details */}
            <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-4xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <User className="w-5 h-5 text-indigo-400" />
                  Personal Information
                </h3>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-indigo-400 text-sm font-semibold rounded-xl transition-all"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-8">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-white transition-all"
                      required
                    />
                  ) : (
                    <div className="text-lg text-white font-medium">{profile.name}</div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-xl text-slate-500 cursor-not-allowed opacity-80"
                    />
                  ) : (
                    <div className="text-lg text-white font-medium">{profile.email}</div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mobile Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone || ""}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-white transition-all"
                    />
                  ) : (
                    <div className="text-lg text-white font-medium">{profile.phone || <span className="text-slate-600 italic">Not provided</span>}</div>
                  )}
                </div>
              </div>
            </div>


            {/* Professional Details (Brokers / Sellers only) */}
            {isProfessional && (
              <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-4xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                  Professional Details
                </h3>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-8">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Agency / Company Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="agencyName"
                        value={profile.agencyName || ""}
                        onChange={handleChange}
                        placeholder="e.g. Sharma Properties Ltd."
                        className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none text-white transition-all"
                      />
                    ) : (
                      <div className="text-lg text-white font-medium">{profile.agencyName || <span className="text-slate-600 italic">Not provided</span>}</div>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
                      <span>RERA Registration ID</span>
                      {isEditing && <Link href="/rera" className="text-indigo-400 hover:underline capitalize text-xs">Why is this important?</Link>}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="reraId"
                        value={profile.reraId || ""}
                        onChange={handleChange}
                        placeholder="Enter certified RERA ID"
                        className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none text-white transition-all font-mono"
                      />
                    ) : (
                      <div className="text-lg text-white font-medium font-mono">{profile.reraId || <span className="text-slate-600 italic font-sans" >Not provided</span>}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            {isEditing && (
              <div className="flex justify-end gap-4 animate-fade-in">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3.5 rounded-xl font-bold transition-all text-slate-400 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm hover:shadow-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}

          </form>
        </div>

      </div>
    </div>
  );
}
