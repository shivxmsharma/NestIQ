"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, ImagePlus, Loader2, Star } from "lucide-react";

export default function ImageUpload({ images, onChange, maxImages = 10 }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "nestiq/properties");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
    };
  };

  const handleFiles = useCallback(
    async (files) => {
      const remaining = maxImages - images.length;
      if (remaining <= 0) return;

      const filesToUpload = Array.from(files).slice(0, remaining);
      setUploading(true);

      const newImages = [...images];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const tempId = `temp-${Date.now()}-${i}`;

        setUploadProgress((prev) => ({ ...prev, [tempId]: 0 }));

        try {
          // Show local preview immediately
          const reader = new FileReader();
          reader.readAsDataURL(file);

          const uploaded = await uploadToCloudinary(file);
          newImages.push(uploaded);

          setUploadProgress((prev) => {
            const next = { ...prev };
            delete next[tempId];
            return next;
          });
        } catch (err) {
          console.error("Upload error:", err);
        }
      }

      onChange(newImages);
      setUploading(false);
    },
    [images, maxImages, onChange]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const setCover = (index) => {
    const updated = [...images];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
          dragOver
          ? "border-indigo-500 bg-indigo-500/10 scale-[1.02] shadow-[0_0_20px_rgba(79,70,229,0.2)]"
          : "border-white/20 hover:border-indigo-400 hover:bg-white/5 hover:shadow-lg"
          } ${images.length >= maxImages ? " opacity-40 pointer-events-none" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
          ) : (
            <div className="w-16 h-16 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <ImagePlus className="w-8 h-8 text-indigo-300" />
            </div>
          )}
          <div>
            <p className="font-bold text-white text-lg">
              {uploading ? "Uploading..." : "Drop photos here or browse"}
            </p>
            <p className="text-sm font-medium text-slate-400 mt-1">
              JPG, PNG, WEBP up to 10MB · <span className="text-indigo-300">{images.length}/{maxImages}</span> uploaded
            </p>
          </div>
        </div>
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div key={img.publicId || index} className="relative group rounded-2xl overflow-hidden aspect-[4/3] bg-white/5 border border-white/10 shadow-sm">
              <Image
                src={img.url}
                alt={`Property photo ${index + 1}`}
                fill
                className="object-cover transition-transform duration-[600ms] group-hover:scale-[1.05]"
              />

              {/* Cover badge */}
              {index === 0 && (
                <span className="absolute top-2 left-2 bg-indigo-600/90 backdrop-blur-md shadow-[0_0_15px_rgba(79,70,229,0.4)] text-white text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border border-indigo-500/50">
                  Cover
                </span>
              )}

              {/* Actions on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] flex items-center justify-center gap-2">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCover(index); }}
                    className="p-2 bg-white/20 hover:bg-white/40 rounded-xl text-white transition-all hover:scale-110"
                    title="Set as cover"
                  >
                    <Star className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                  className="p-2 bg-rose-500/80 hover:bg-rose-500 rounded-xl text-white transition-all hover:scale-110 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                  title="Remove"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}