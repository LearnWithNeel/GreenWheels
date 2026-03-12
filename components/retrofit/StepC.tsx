"use client";
import { useState } from "react";
import { RetrofitFormData } from "@/app/retrofit/page";

type Props = {
  form:       RetrofitFormData;
  updateForm: (data: Partial<RetrofitFormData>) => void;
  nextStep:   () => void;
  prevStep:   () => void;
};

const PHOTOS = [
  { key: "photoFront", label: "Front View",  icon: "⬆️" },
  { key: "photoBack",  label: "Back View",   icon: "⬇️" },
  { key: "photoLeft",  label: "Left Side",   icon: "⬅️" },
  { key: "photoRight", label: "Right Side",  icon: "➡️" },
] as const;

export default function StepC({ form, updateForm, nextStep, prevStep }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  async function handleUpload(
    file: File,
    key: keyof RetrofitFormData
  ) {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setErrors(p => ({ ...p, [key]: "Only image files allowed." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(p => ({ ...p, [key]: "Image must be under 5MB." }));
      return;
    }

    setUploading(key as string);
    setErrors(p => ({ ...p, [key]: "" }));

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("key", key as string);

      const res  = await fetch("/api/upload", {
        method: "POST",
        body:   data,
      });
      const json = await res.json();

      if (!json.success) {
        setErrors(p => ({ ...p, [key]: json.message }));
        return;
      }

      updateForm({ [key]: json.url } as Partial<RetrofitFormData>);
    } catch {
      setErrors(p => ({ ...p, [key]: "Upload failed. Try again." }));
    } finally {
      setUploading(null);
    }
  }

  const allUploaded =
    form.photoFront &&
    form.photoBack  &&
    form.photoLeft  &&
    form.photoRight;

  return (
    <div>
      <h2 className="font-black text-xl text-white mb-2">
        Upload 4 photos of your vehicle
      </h2>
      <p className="text-gw-400 text-sm mb-6">
        Clear photos from all 4 sides help the dealer verify your
        vehicle faster. Max 5MB each.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {PHOTOS.map(({ key, label, icon }) => {
          const uploaded = form[key] as string;
          const isUploading = uploading === key;

          return (
            <div key={key}>
              <label className="label">{icon} {label}</label>

              {uploaded ? (
                <div style={{ border: "2px solid #a3e635" }}
                  className="rounded-xl overflow-hidden relative">
                  <img
                    src={uploaded}
                    alt={label}
                    className="w-full h-32 object-cover"
                  />
                  <button
                    onClick={() => updateForm({
                      [key]: ""
                    } as Partial<RetrofitFormData>)}
                    className="absolute top-2 right-2 bg-red-900/80
                               text-red-300 text-xs px-2 py-1 rounded-lg">
                    Remove
                  </button>
                </div>
              ) : (
                <label
                  style={{ border: "2px dashed #14532d" }}
                  className={`flex flex-col items-center justify-center
                    h-32 rounded-xl cursor-pointer transition-all
                    hover:border-gw-500 bg-gw-900/50
                    ${isUploading ? "opacity-60 cursor-wait" : ""}`}>
                  {isUploading ? (
                    <div className="text-gw-400 text-sm">Uploading...</div>
                  ) : (
                    <>
                      <span className="text-3xl mb-2">📷</span>
                      <span className="text-gw-400 text-xs">
                        Tap to upload
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, key);
                    }}
                  />
                </label>
              )}

              {errors[key] && (
                <p className="text-red-400 text-xs mt-1">{errors[key]}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button className="btn-secondary flex-1" onClick={prevStep}>
          ← Back
        </button>
        <button
          className="btn-primary flex-1"
          onClick={nextStep}
          disabled={!allUploaded}>
          Continue →
        </button>
      </div>
    </div>
  );
}