"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingDots from "@/components/LoadingDots";

type Complaint = {
  _id:              string;
  complainantName:  string;
  complainantEmail: string;
  complainantRole:  string;
  type:             string;
  against:          string;
  againstName:      string;
  orderNumber:      string;
  subject:          string;
  description:      string;
  evidence:         string[];
  status:           string;
  priority:         string;
  agentNotes:       string;
  agentVerdict?:    string;
  declarationAccepted: boolean;
  orderVerified:    boolean;
  createdAt:        string;
};

type SupportUser = {
  id:    string;
  name:  string;
  email: string;
  role:  string;
};

const STATUS_COLORS: Record<string, string> = {
  open:          "text-yellow-400 border-yellow-700 bg-yellow-900/20",
  under_review:  "text-blue-400 border-blue-700 bg-blue-900/20",
  investigating: "text-purple-400 border-purple-700 bg-purple-900/20",
  resolved:      "text-lime-400 border-lime-700 bg-lime-900/20",
  dismissed:     "text-gw-400 border-gw-700 bg-gw-900/20",
  escalated:     "text-red-400 border-red-700 bg-red-900/20",
};

const PRIORITY_COLORS: Record<string, string> = {
  low:      "text-gw-400",
  medium:   "text-yellow-400",
  high:     "text-orange-400",
  critical: "text-red-400",
};

export default function SupportDashboardPage() {
  const router = useRouter();
  const [user, setUser]           = useState<SupportUser | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Complaint | null>(null);
  const [agentNotes, setAgentNotes] = useState("");
  const [verdict, setVerdict]     = useState<"guilty"|"not_guilty"|"partial"|"">("");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  // Profile access state
  const [showProfileAccess, setShowProfileAccess] = useState(false);
  const [profileEmail, setProfileEmail]   = useState("");
  const [profileRole, setProfileRole]     = useState("customer");
  const [profileOtp, setProfileOtp]       = useState("");
  const [profileStep, setProfileStep]     = useState<"email"|"otp"|"result">("email");
  const [profileData, setProfileData]     = useState<Record<string, unknown> | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError]   = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res  = await fetch("/api/support/auth/me");
      const data = await res.json();
      if (!data.success) { router.push("/support-portal/login"); return; }
      setUser(data.user);
      loadComplaints();
    } catch { router.push("/support-portal/login"); }
  }

  async function loadComplaints() {
    try {
      const res  = await fetch("/api/complaints");
      const data = await res.json();
      if (data.success) setComplaints(data.complaints);
    } catch {}
    finally { setLoading(false); }
  }

  async function handleLogout() {
    await fetch("/api/support/auth", { method: "DELETE" });
    router.push("/support-portal/login");
  }

  async function handleUpdateComplaint() {
    if (!selected) return;
    setSaving(true); setError("");
    try {
      const body: Record<string, unknown> = {
        agentNotes,
        status: "investigating",
      };
      if (verdict) body.agentVerdict = verdict;

      const res  = await fetch(`/api/complaints/${selected._id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setSelected(null);
      loadComplaints();
    } catch { setError("Something went wrong."); }
    finally { setSaving(false); }
  }

  async function requestProfileAccess() {
    setProfileLoading(true); setProfileError("");
    try {
      const res  = await fetch("/api/support/profile-access", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          targetEmail: profileEmail,
          targetRole:  profileRole,
          action:      "request",
        }),
      });
      const data = await res.json();
      if (!data.success) { setProfileError(data.message); return; }
      setProfileStep("otp");
    } catch { setProfileError("Something went wrong."); }
    finally { setProfileLoading(false); }
  }

  async function verifyProfileOtp() {
    setProfileLoading(true); setProfileError("");
    try {
      const res  = await fetch("/api/support/profile-access", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          targetEmail: profileEmail,
          targetRole:  profileRole,
          action:      "verify",
          otp:         profileOtp,
        }),
      });
      const data = await res.json();
      if (!data.success) { setProfileError(data.message); return; }
      setProfileData(data.profile);
      setProfileStep("result");
    } catch { setProfileError("Something went wrong."); }
    finally { setProfileLoading(false); }
  }

  return (
    <main className="min-h-screen bg-gw-950">

      {/* Navbar */}
      <nav style={{ borderBottom: "1px solid #14532d" }}
        className="bg-gw-950 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🛡️</span>
          <div>
            <p className="text-white font-black text-sm">
              Support Portal
            </p>
            <p className="text-gw-600 text-xs">
              Agent Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowProfileAccess(!showProfileAccess)}
            className="btn-secondary text-xs py-2 px-3">
            🔍 Profile Access
          </button>
          <div style={{ border: "1px solid #14532d" }}
            className="px-3 py-2 rounded-xl">
            <p className="text-white text-xs font-bold">{user?.name}</p>
            <p className="text-gw-600 text-xs">{user?.role}</p>
          </div>
          <button onClick={handleLogout}
            className="text-red-400 text-xs hover:text-red-300
                       transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Profile Access Panel */}
        {showProfileAccess && (
          <div style={{ border: "1px solid #14532d" }}
            className="bg-gw-900/30 rounded-2xl p-5 mb-6">
            <h3 className="font-black text-white text-lg mb-4">
              🔍 Profile Access — OTP Protected
            </h3>

            {profileError && (
              <div className="bg-red-900/30 border border-red-700/50
                              text-red-400 text-sm rounded-xl
                              px-4 py-3 mb-4">
                {profileError}
              </div>
            )}

            {profileStep === "email" && (
              <div className="flex gap-3 flex-wrap">
                <select className="input py-2 text-sm w-auto"
                  value={profileRole}
                  onChange={e => setProfileRole(e.target.value)}>
                  <option value="customer">Customer</option>
                  <option value="dealer">Dealer</option>
                </select>
                <input className="input flex-1 min-w-48"
                  placeholder="Enter user email..."
                  value={profileEmail}
                  onChange={e => setProfileEmail(e.target.value)}/>
                <button
                  className="btn-primary text-sm py-2 px-4"
                  onClick={requestProfileAccess}
                  disabled={profileLoading}>
                  {profileLoading ? "Sending..." : "Send OTP →"}
                </button>
              </div>
            )}

            {profileStep === "otp" && (
              <div>
                <p className="text-gw-400 text-sm mb-3">
                  OTP sent to <strong className="text-white">
                  {profileEmail}</strong>.
                  Ask them to share it with you.
                </p>
                <div className="flex gap-3">
                  <input className="input flex-1"
                    placeholder="Enter 6-digit OTP..."
                    maxLength={6}
                    value={profileOtp}
                    onChange={e => setProfileOtp(
                      e.target.value.replace(/\D/g, "")
                    )}/>
                  <button
                    className="btn-primary text-sm py-2 px-4"
                    onClick={verifyProfileOtp}
                    disabled={profileLoading}>
                    {profileLoading ? "Verifying..." : "Verify →"}
                  </button>
                  <button
                    className="btn-secondary text-sm py-2 px-4"
                    onClick={() => {
                      setProfileStep("email");
                      setProfileOtp("");
                    }}>
                    Back
                  </button>
                </div>
              </div>
            )}

            {profileStep === "result" && profileData && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-lime-400 text-sm font-bold">
                    ✅ Profile access granted — expires in 15 minutes
                  </p>
                  <button
                    onClick={() => {
                      setProfileStep("email");
                      setProfileData(null);
                      setProfileEmail("");
                      setProfileOtp("");
                    }}
                    className="text-gw-500 text-xs hover:text-white">
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(profileData)
                    .filter(([k]) => !["password","otpCode","otpExpiry","__v"].includes(k))
                    .map(([key, val]) => (
                      <div key={key}
                        style={{ border: "1px solid #14532d" }}
                        className="bg-gw-900/30 rounded-xl px-3 py-2">
                        <p className="text-gw-600 text-xs mb-1 capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </p>
                        <p className="text-white text-xs font-semibold
                                      truncate">
                          {typeof val === "object"
                            ? JSON.stringify(val)
                            : String(val || "—")}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: "📋", label: "Total",       value: complaints.length },
            { icon: "🟡", label: "Open",        value: complaints.filter(c => c.status === "open").length },
            { icon: "🔍", label: "Investigating",value: complaints.filter(c => c.status === "investigating").length },
            { icon: "✅", label: "Resolved",    value: complaints.filter(c => c.status === "resolved").length },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-black text-2xl text-white">{s.value}</div>
              <div className="text-gw-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Complaints List */}
        <h2 className="font-black text-white text-xl mb-4">
          Assigned Complaints
        </h2>

        {loading ? (
          <p className="text-gw-400 text-center py-12">
            Loading complaints...
          </p>
        ) : complaints.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gw-400">No complaints assigned yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {complaints.map(c => (
              <div key={c._id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className={`text-xs font-bold capitalize
                        ${PRIORITY_COLORS[c.priority]}`}>
                        ● {c.priority}
                      </span>
                      <span style={{ border: "1px solid" }}
                        className={`text-xs px-2 py-0.5 rounded-lg
                          capitalize ${STATUS_COLORS[c.status] || ""}`}>
                        {c.status.replace(/_/g, " ")}
                      </span>
                      {c.declarationAccepted && (
                        <span style={{ border: "1px solid #14532d" }}
                          className="text-xs text-lime-400 px-2 py-0.5
                                     rounded-lg bg-gw-900">
                          ✅ Declaration signed
                        </span>
                      )}
                      {c.orderVerified && (
                        <span style={{ border: "1px solid #14532d" }}
                          className="text-xs text-lime-400 px-2 py-0.5
                                     rounded-lg bg-gw-900">
                          ✅ Order verified
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-white text-base mb-1">
                      {c.subject}
                    </h3>
                    <p className="text-gw-500 text-xs mb-1">
                      From: {c.complainantName} ({c.complainantEmail})
                      {c.againstName && ` → Against: ${c.againstName}`}
                    </p>
                    <p className="text-gw-600 text-xs">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <button onClick={() => {
                    setSelected(c);
                    setAgentNotes(c.agentNotes || "");
                    setVerdict((c.agentVerdict as typeof verdict) || "");
                    setError("");
                  }}
                    className="btn-secondary text-xs py-2 px-4 shrink-0">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center
                        justify-center bg-black/70 px-4 py-8
                        overflow-y-auto">
          <div style={{ border: "1px solid #14532d" }}
            className="bg-gw-950 rounded-2xl p-6 max-w-2xl
                       w-full my-auto">

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-white text-xl">
                Review Complaint
              </h2>
              <button onClick={() => setSelected(null)}
                className="text-gw-500 hover:text-white text-xl">
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700/50
                              text-red-400 text-sm rounded-xl
                              px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4">

              {/* Complaint details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "From",         value: `${selected.complainantName} (${selected.complainantRole})` },
                  { label: "Against",      value: selected.againstName || selected.against },
                  { label: "Type",         value: selected.type.replace(/_/g, " ") },
                  { label: "Order No",     value: selected.orderNumber || "—" },
                  { label: "Priority",     value: selected.priority },
                  { label: "Status",       value: selected.status.replace(/_/g, " ") },
                ].map(item => (
                  <div key={item.label}
                    style={{ border: "1px solid #14532d" }}
                    className="bg-gw-900/30 rounded-xl px-3 py-2">
                    <p className="text-gw-500 text-xs mb-0.5">{item.label}</p>
                    <p className="text-white text-sm font-semibold capitalize">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div style={{ border: "1px solid #14532d" }}
                className="bg-gw-900/30 rounded-xl px-4 py-3">
                <p className="text-gw-500 text-xs mb-1">Description</p>
                <p className="text-white text-sm leading-relaxed">
                  {selected.description}
                </p>
              </div>

              {/* Evidence */}
              {selected.evidence?.length > 0 && (
                <div>
                  <p className="text-gw-500 text-xs mb-2">Evidence</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.evidence.map((url, i) => (
                      <a key={i} href={url} target="_blank"
                        className="text-lime-400 text-xs hover:underline
                                   border border-gw-800 px-3 py-1.5
                                   rounded-lg">
                        📎 File {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Agent notes */}
              <div>
                <label className="label">Investigation Notes</label>
                <textarea
                  className="input min-h-[100px] resize-none"
                  placeholder="Add your investigation notes here..."
                  value={agentNotes}
                  onChange={e => setAgentNotes(e.target.value)}
                />
              </div>

              {/* Verdict */}
              <div>
                <label className="label">Your Verdict</label>
                <div className="flex gap-3">
                  {[
                    { key: "guilty",     label: "Guilty",     color: "#ef4444" },
                    { key: "not_guilty", label: "Not Guilty", color: "#a3e635" },
                    { key: "partial",    label: "Partial",    color: "#fbbf24" },
                  ].map(v => (
                    <button key={v.key} type="button"
                      onClick={() => setVerdict(
                        v.key as typeof verdict
                      )}
                      style={{
                        border: `2px solid ${verdict === v.key
                          ? v.color : "#14532d"}`,
                        color: verdict === v.key ? v.color : "#4a7c59",
                      }}
                      className="flex-1 py-2 rounded-xl text-sm
                                 font-bold transition-all">
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn-primary w-full"
                onClick={handleUpdateComplaint}
                disabled={saving}>
                {saving ? "Saving..." : "Save Investigation →"}
              </button>

            </div>
          </div>
        </div>
      )}

    </main>
  );
}