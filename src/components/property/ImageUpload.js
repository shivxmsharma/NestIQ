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
    <div className=" space-y-4 ">
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver
          ? "border-blue-500 bg-blue-50 scale-[1.01]"
          : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
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
        <div className=" flex flex-col items-center gap-3">
          {uploading ? (
            <Loader2 className=" w-10 h-10 text-blue-500 animate-spin" />
          ) : (
            <div className=" w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
              <ImagePlus className=" w-7 h-7 text-blue-600" />
            </div>
          )}
          <div>
            <p className=" font-semibold text-gray-700">
              {uploading ? "Uploading..." : "Drop photos here or click to browse"}
            </p>
            <p className=" text-sm text-gray-700">
              JPG, PNG, WEBP up to 10MB · {images.length}/{maxImages} uploaded
            </p>
          </div>
        </div>
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className=" grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div key={img.publicId || index} className=" relative group rounded-xl overflow-hidden aspect-4/3 bg-gray-100">
              <Image
                src={img.url}
                alt={`Property photo ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* Cover badge */}
              {index === 0 && (
                <span className=" absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Cover
                </span>
              )}

              {/* Actions on hover */}
              <div className=" absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCover(index); }}
                    className=" p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition"
                    title="Set as cover"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                  className=" p-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg text-white transition"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}