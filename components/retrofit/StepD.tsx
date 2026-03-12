"use client";
import { useState } from "react";
import { RetrofitFormData } from "@/app/retrofit/page";

type Props = {
  form:       RetrofitFormData;
  updateForm: (data: Partial<RetrofitFormData>) => void;
  nextStep:   () => void;
  prevStep:   () => void;
};

export default function StepD({ form, updateForm, nextStep, prevStep }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleRCUpload(file: File) {
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setUploadError("Only image or PDF files allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File must be under 10MB.");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("key", "rcDocument");

      const res  = await fetch("/api/upload", {
        method: "POST",
        body:   data,
      });
      const json = await res.json();

      if (!json.success) {
        setUploadError(json.message);
        return;
      }
      updateForm({ rcDocument: json.url });
    } catch {
      setUploadError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  const valid =
    form.rcDocument &&
    form.ownerName  &&
    form.ownerAddress;

  return (
    <div>
      <h2 className="font-black text-xl text-white mb-2">
        Ownership & Documents
      </h2>
      <p className="text-gw-400 text-sm mb-6">
        Upload your RC book and confirm ownership details.
        These are verified on-site by our verifier.
      </p>

      <div className="flex flex-col gap-4 mb-8">

        {/* RC Document Upload */}
        <div>
          <label className="label">RC Book / Registration Certificate</label>
          {form.rcDocument ? (
            <div style={{ border: "2px solid #a3e635" }}
              className="rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <div className="text-white text-sm font-semibold">
                    Document uploaded ✓
                  </div>
                  <a href={form.rcDocument} target="_blank"
                    className="text-lime-400 text-xs hover:underline">
                    View uploaded document
                  </a>
                </div>
              </div>
              <button
                onClick={() => updateForm({ rcDocument: "" })}
                className="text-red-400 text-xs hover:text-red-300">
                Remove
              </button>
            </div>
          ) : (
            <label
              style={{ border: "2px dashed #14532d" }}
              className={`flex flex-col items-center justify-center h-32
                rounded-xl cursor-pointer hover:border-gw-500
                bg-gw-900/50 transition-all
                ${uploading ? "opacity-60 cursor-wait" : ""}`}>
              {uploading ? (
                <div className="text-gw-400 text-sm">Uploading...</div>
              ) : (
                <>
                  <span className="text-3xl mb-2">📄</span>
                  <span className="text-gw-400 text-sm font-medium">
                    Upload RC Book
                  </span>
                  <span className="text-gw-600 text-xs mt-1">
                    Image or PDF — max 10MB
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                disabled={uploading}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleRCUpload(file);
                }}
              />
            </label>
          )}
          {uploadError && (
            <p className="text-red-400 text-xs mt-1">{uploadError}</p>
          )}
        </div>

        {/* Owner Name */}
        <div>
          <label className="label">Owner Name (as on RC)</label>
          <input className="input"
            placeholder="Full name exactly as on RC book"
            value={form.ownerName}
            onChange={e => updateForm({ ownerName: e.target.value })} />
          <p className="text-gw-600 text-xs mt-1">
            Must match the name on your Registration Certificate.
          </p>
        </div>

        {/* Owner Address */}
        <div>
          <label className="label">Address (as on RC)</label>
          <textarea className="input min-h-[80px] resize-none"
            placeholder="Full address as mentioned on RC book"
            value={form.ownerAddress}
            onChange={e => updateForm({ ownerAddress: e.target.value })} />
        </div>

        {/* Info Box */}
        <div style={{ border: "1px solid #14532d" }}
          className="bg-gw-900/30 rounded-xl px-4 py-3">
          <p className="text-gw-400 text-xs leading-relaxed">
            <span className="text-white font-semibold">ℹ️ Note: </span>
            Your documents are uploaded securely to Cloudinary and are only
            visible to our admin-verified dealers after order acceptance.
            Documents are used solely for ownership verification purposes.
          </p>
        </div>

      </div>

      <div className="flex gap-3">
        <button className="btn-secondary flex-1" onClick={prevStep}>
          ← Back
        </button>
        <button
          className="btn-primary flex-1"
          onClick={nextStep}
          disabled={!valid}>
          Continue →
        </button>
      </div>
    </div>
  );
}