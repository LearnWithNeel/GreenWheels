"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CERTIFICATIONS_LIST = [
  "ARAI Certified", "ICAT Certified", "ISO 9001",
  "BIS Certified", "State EV Certified", "Other",
];

export default function DealerProfilePage() {
  const { data: session } = useSession();
  const router            = useRouter();
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  // Upload states
  const [uploadingWorkshop, setUploadingWorkshop] = useState(false);

  const [form, setForm] = useState({
    workshopPhotos:  [] as string[],
    certifications:  [] as string[],
    garageImages:    [] as string[],
  });

  // Load existing profile
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res  = await fetch("/api/dealer/profile");
        const data = await res.json();
        if (data.success && data.dealer) {
          setForm({
            workshopPhotos: data.dealer.workshopPhotos || [],
            certifications: data.dealer.certifications || [],
            garageImages:   data.dealer.garageImages   || [],
          });
        }
      } catch {}
      finally { setLoading(false); }
    }
    if (session) load();
  }, [session]);

  async function handleWorkshopUpload(file: File) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB."); return;
    }
    setUploadingWorkshop(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("key", "workshopPhoto");
      const res  = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!json.success) { setError(json.message); return; }
      setForm(prev => ({
        ...prev,
        workshopPhotos: [...prev.workshopPhotos, json.url],
        garageImages:   [...prev.garageImages,   json.url],
      }));
    } catch { setError("Upload failed. Try again."); }
    finally { setUploadingWorkshop(false); }
  }

  function toggleCertification(cert: string) {
    setForm(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert],
    }));
  }

  async function handleSave() {
    setSaving(true); setError(""); setSuccess("");
    try {
      const res  = await fetch("/api/dealer/profile", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setSuccess("Profile updated successfully! Admin will review shortly.");
    } catch { setError("Something went wrong."); }
    finally { setSaving(false); }
  }

  if (loading) {
    return (
      <main className="page-wrapper flex items-center justify-center">
        <p className="text-gw-400">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="page-wrapper">
      <section className="section max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <div className="badge-green inline-block mb-3">
            Dealer Profile
          </div>
          <h1 className="font-black text-3xl text-white mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gw-400 text-sm">
            Upload workshop photos and certifications for admin review.
            The more complete your profile — the faster approval.
          </p>
        </div>

        <div className="card flex flex-col gap-6">

          {error && (
            <div className="bg-red-900/30 border border-red-700/50
                            text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-gw-900/50 border border-lime-700/50
                            text-lime-400 text-sm rounded-xl px-4 py-3">
              {success}
            </div>
          )}

          {/* ── Workshop Photos ── */}
          <div>
            <label className="label mb-2 block">
              Workshop / Garage Photos
            </label>
            <p className="text-gw-500 text-xs mb-3">
              Upload clear photos of your workshop — inside, outside,
              equipment. Minimum 2 photos recommended.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-3">
              {form.workshopPhotos.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt={`Workshop ${i + 1}`}
                    className="w-full h-24 object-cover rounded-xl" />
                  <button
                    onClick={() => setForm(prev => ({
                      ...prev,
                      workshopPhotos: prev.workshopPhotos.filter(
                        (_, j) => j !== i
                      ),
                      garageImages: prev.garageImages.filter(
                        (_, j) => j !== i
                      ),
                    }))}
                    className="absolute top-1 right-1 bg-red-900/80
                               text-red-300 text-xs px-1.5 py-0.5
                               rounded-lg">
                    ✕
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              <label
                style={{ border: "2px dashed #14532d" }}
                className={`flex flex-col items-center justify-center
                  h-24 rounded-xl cursor-pointer hover:border-gw-500
                  bg-gw-900/50 transition-all
                  ${uploadingWorkshop ? "opacity-60 cursor-wait" : ""}`}>
                {uploadingWorkshop ? (
                  <span className="text-gw-400 text-xs">Uploading...</span>
                ) : (
                  <>
                    <span className="text-2xl mb-1">📷</span>
                    <span className="text-gw-500 text-xs">Add Photo</span>
                  </>
                )}
                <input type="file" accept="image/*"
                  className="hidden" disabled={uploadingWorkshop}
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleWorkshopUpload(f);
                  }} />
              </label>
            </div>
          </div>

          {/* ── Certifications ── */}
          <div>
            <label className="label mb-2 block">
              Certifications & Approvals
            </label>
            <p className="text-gw-500 text-xs mb-3">
              Select all certifications your workshop holds.
              These are verified by admin.
            </p>
            <div className="flex flex-wrap gap-2">
              {CERTIFICATIONS_LIST.map(cert => (
                <button key={cert} type="button"
                  onClick={() => toggleCertification(cert)}
                  style={{
                    border: `2px solid ${
                      form.certifications.includes(cert)
                        ? "#a3e635" : "#14532d"
                    }`,
                  }}
                  className={`px-3 py-2 rounded-xl text-sm font-medium
                    transition-all
                    ${form.certifications.includes(cert)
                      ? "bg-lime-400/10 text-white"
                      : "bg-gw-900/50 text-gw-400"
                    }`}>
                  {form.certifications.includes(cert) ? "✓ " : ""}{cert}
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div style={{ border: "1px solid #14532d" }}
            className="bg-gw-900/30 rounded-xl px-4 py-3">
            <p className="text-gw-400 text-xs leading-relaxed">
              <span className="text-white font-semibold">ℹ️ Note: </span>
              Your profile is reviewed by our admin team within 24–48 hours.
              Once approved you will be visible to customers and start
              receiving retrofit orders.
            </p>
          </div>

          <button className="btn-primary w-full"
            onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Profile →"}
          </button>

        </div>

      </section>
    </main>
  );
}