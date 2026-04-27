"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { User, Phone, CheckCircle2, XCircle, ShieldCheck, Mail, Briefcase, Settings, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SafeImage from "../../../components/common/SafeImage";

export default function ProfilePage() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  const [activeTab, setActiveTab] = useState("profile");

  // Picture upload & ui state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarConfirm, setShowAvatarConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const fileInputRef = useRef(null);

  // Status message
  const [statusMsg, setStatusMsg] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchProfile();
  }, [status]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
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
      setStatusMsg("Cloudinary not configured completely.");
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
      setStatusMsg("Avatar successfully uploaded!");

    } catch (error) {
      console.error(error);
      setStatusMsg("Failed to upload image.");
    } finally {
      setUploadingAvatar(false);
      e.target.value = null; // reset input
      setTimeout(() => setStatusMsg(""), 5000);
    }
  };

  const handleRemoveAvatar = async () => {
    setShowAvatarConfirm(false);
    setProfile(prev => ({ ...prev, avatar: "" }));

    await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar: "" }),
    });

    await update({
      ...session,
      user: { ...session.user, avatar: "" }
    });

    setStatusMsg("Avatar successfully removed!");
    setTimeout(() => setStatusMsg(""), 5000);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
      <XCircle size={48} className="mb-4 text-slate-500" />
      <p>Could not load profile.</p>
    </div>
  );

  const TABS = [
    { id: "profile", label: "Profile Information", icon: User },
    { id: "security", label: "Security & Account", icon: ShieldCheck },
  ];

  return (
    <div className="max-w-4xl mx-auto w-full pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Profile Settings</h1>
        <p className="text-slate-400 mt-2">Manage your account information, preferences, and privacy.</p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Horizontal Navigation Tabs */}
        <div className="w-full shrink-0 border-b border-white/10 pb-4">
          <nav className="flex flex-row gap-2 overflow-x-auto custom-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all text-sm font-semibold whitespace-nowrap ${isActive
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.15)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          {statusMsg && (
            <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 backdrop-blur-sm border ${statusMsg.includes('success') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {statusMsg.includes('success') ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
              <p className="text-sm font-medium">{statusMsg}</p>
            </div>
          )}

          {activeTab === "profile" && (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Photo Upload Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 mb-8 border-b border-white/10">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                />

                <div className="relative group shrink-0">
                  {profile.avatar ? (
                    <div className="relative">
                      <SafeImage
                        src={profile.avatar}
                        alt={profile.name}
                        width={96}
                        height={96}
                        fallbackType="avatar"
                        fallbackClassName="bg-indigo-500/20 text-indigo-400"
                        className="w-24 h-24 rounded-full object-cover shadow-[0_0_30px_rgba(255,255,255,0.1)] ring-4 ring-white/10"
                      />
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-3xl font-bold shadow-[0_0_30px_rgba(79,70,229,0.2)]">
                      {uploadingAvatar ? (
                        <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        profile.name?.[0]?.toUpperCase()
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-white mb-1">Profile Photo</h3>
                  <p className="text-sm text-slate-400 tracking-wide mb-4">Recommended size: 256x256px. Formats: JPG, PNG, WEBP.</p>

                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="text-sm font-semibold px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white rounded-xl shadow-lg border border-indigo-500/30 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                    >
                      <ImageIcon size={16} />
                      {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                    </button>
                    {profile.avatar && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowAvatarConfirm(!showAvatarConfirm)}
                          disabled={uploadingAvatar}
                          className="text-sm font-semibold px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all text-red-500 rounded-xl border border-red-500/20 disabled:opacity-50 flex items-center gap-2"
                        >
                          Remove
                        </button>

                        {showAvatarConfirm && (
                          <div className="absolute top-12 left-0 w-48 bg-slate-900 border border-white/10 rounded-xl p-3 shadow-2xl z-50 animate-in zoom-in-95 duration-200">
                            <p className="text-xs text-slate-300 mb-3 font-medium">Remove profile photo?</p>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={handleRemoveAvatar} className="flex-1 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors">Yes</button>
                              <button type="button" onClick={() => setShowAvatarConfirm(false)} className="flex-1 px-3 py-1.5 bg-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/20 transition-colors">No</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">

                <div className="space-y-1.5 focus-within:text-indigo-400 text-slate-400 transition-colors">
                  <label className="text-xs font-semibold tracking-wider uppercase ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-inherit opacity-50 transition-colors" />
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-slate-600"
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-slate-500">
                  <label className="text-xs font-semibold tracking-wider uppercase ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-inherit opacity-40" />
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/5 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                    <p className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wide opacity-50">Unchangeable</p>
                  </div>
                </div>

                <div className="space-y-1.5 focus-within:text-indigo-400 text-slate-400 transition-colors">
                  <label className="text-xs font-semibold tracking-wider uppercase ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-inherit opacity-50 transition-colors" />
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone || ""}
                      onChange={handleChange}
                      placeholder="Enter 10-digit number"
                      className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-slate-600"
                    />
                  </div>
                </div>

                {/* Seller/Broker specific fields */}
                {['seller', 'broker', 'admin'].includes(profile.role) && (
                  <div className="space-y-1.5 focus-within:text-indigo-400 text-slate-400 transition-colors">
                    <label className="text-xs font-semibold tracking-wider uppercase ml-1">Agency / Business Name</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-inherit opacity-50 transition-colors" />
                      <input
                        type="text"
                        name="agencyName"
                        value={profile.agencyName || ""}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-slate-600"
                      />
                    </div>
                  </div>
                )}

                {profile.role === 'broker' && (
                  <div className="space-y-1.5 focus-within:text-indigo-400 text-slate-400 transition-colors">
                    <label className="text-xs font-semibold tracking-wider uppercase ml-1">RERA ID</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-inherit opacity-50 transition-colors" />
                      <input
                        type="text"
                        name="reraId"
                        value={profile.reraId || ""}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-slate-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-4 max-w-lg">
                <h3 className="text-xl font-bold text-white tracking-tight">Update Password</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Ensure your account is using a long, random password to stay secure and protect your real estate data.</p>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setStatusMsg("");
                    const currentPassword = e.target.currentPassword.value;
                    const newPassword = e.target.newPassword.value;
                    if (newPassword.length < 8) {
                      setStatusMsg("New password must be at least 8 characters long.");
                      return;
                    }

                    try {
                      setSaving(true);
                      const res = await fetch("/api/user/password", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ currentPassword, newPassword }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setStatusMsg(data.message || "Password updated successfully!");
                        e.target.reset();
                      } else {
                        setStatusMsg(data.message || "Failed to update password");
                      }
                    } catch (err) {
                      console.error(err);
                      setStatusMsg("Something went wrong");
                    } finally {
                      setSaving(false);
                      setTimeout(() => setStatusMsg(""), 5000);
                    }
                  }}
                  className="space-y-6 pt-4"
                >
                  <div className="space-y-1.5 focus-within:text-indigo-400 text-slate-400 transition-colors">
                    <label className="text-xs font-semibold tracking-wider uppercase ml-1">Current Password</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-inherit opacity-50 transition-colors" />
                      <input
                        name="currentPassword"
                        type="password"
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-slate-600"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 focus-within:text-indigo-400 text-slate-400 transition-colors">
                    <label className="text-xs font-semibold tracking-wider uppercase ml-1">New Password</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-inherit opacity-50 transition-colors" />
                      <input
                        name="newPassword"
                        type="password"
                        required
                        minLength={8}
                        className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-slate-600"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={saving} className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white font-semibold rounded-xl shadow-lg mt-2 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2">
                    {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {saving ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>

              <div className="pt-10 mt-10 border-t border-white/10">
                <div className="max-w-lg bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-slate-400 mt-2 mb-6 leading-relaxed">
                    Once you delete your account, there is no going back. All your saved properties, messages, and active listings will be permanently wiped from our servers. Please be certain.
                  </p>

                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-6 py-2.5 bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)] text-white font-bold rounded-xl transition-all"
                    >
                      Delete Account
                    </button>
                  ) : (
                    <div className="bg-black/40 border border-red-500/30 rounded-xl p-5 mt-4 space-y-4 animate-in slide-in-from-top-4 duration-300">
                      <p className="text-sm font-medium text-white">This action is permanent. Type <span className="font-bold text-red-400">DELETE</span> to confirm.</p>
                      <input
                        type="text"
                        value={deleteInput}
                        onChange={(e) => setDeleteInput(e.target.value)}
                        placeholder="Type DELETE"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors placeholder-slate-600"
                      />
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={async () => {
                            if (deleteInput === "DELETE") {
                              setSaving(true);
                              try {
                                const res = await fetch("/api/user", { method: "DELETE" });
                                if (res.ok) {
                                  await signOut({ callbackUrl: "/" });
                                }
                              } catch (err) {
                                console.error(err);
                                setStatusMsg("Failed to delete account");
                              } finally {
                                setSaving(false);
                              }
                            }
                          }}
                          disabled={saving || deleteInput !== "DELETE"}
                          className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-lg disabled:opacity-50 hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                        >
                          {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                          Confirm Destruction
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteInput("");
                          }}
                          className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 transition-colors text-white font-semibold rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
