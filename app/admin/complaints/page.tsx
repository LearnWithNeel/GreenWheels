"use client";
import { useState, useEffect } from "react";

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
  leaderNotes:      string;
  leaderApproved?:  boolean;
  adminAction?:     string;
  adminNotes:       string;
  declarationAccepted: boolean;
  orderVerified:    boolean;
  createdAt:        string;
  resolvedAt?:      string;
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

const ADMIN_ACTIONS = [
  { key: "warning",    label: "⚠️ Issue Warning",      color: "#fbbf24" },
  { key: "suspension", label: "⏸️ Suspend Account",    color: "#f97316" },
  { key: "ban",        label: "🚫 Permanent Ban",       color: "#ef4444" },
  { key: "refund",     label: "💰 Issue Refund",        color: "#a3e635" },
  { key: "cleared",    label: "✅ Clear — No Action",   color: "#4ade80" },
];

export default function AdminComplaintsPage() {
  const [complaints, setComplaints]   = useState<Complaint[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("escalated");
  const [selected, setSelected]       = useState<Complaint | null>(null);
  const [adminAction, setAdminAction] = useState("");
  const [adminNotes, setAdminNotes]   = useState("");
  const [resolution, setResolution]   = useState("");
  const [acting, setActing]           = useState(false);
  const [error, setError]             = useState("");

  useEffect(() => { loadComplaints(); }, [filter]);

  async function loadComplaints() {
    setLoading(true);
    try {
      const url = filter === "all"
        ? "/api/complaints"
        : `/api/complaints?status=${filter}`;
      const res  = await fetch(url);
      const data = await res.json();
      if (data.success) setComplaints(data.complaints);
    } catch {}
    finally { setLoading(false); }
  }

  async function handleAdminAction() {
    if (!selected || !adminAction) {
      setError("Please select an action."); return;
    }
    setActing(true); setError("");
    try {
      const res  = await fetch(`/api/complaints/${selected._id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          adminAction,
          adminNotes,
          resolution,
          status: "resolved",
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setSelected(null);
      setAdminAction("");
      setAdminNotes("");
      setResolution("");
      loadComplaints();
    } catch { setError("Something went wrong."); }
    finally { setActing(false); }
  }

  return (
    <main className="page-wrapper">
      <section className="section max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="badge-green inline-block mb-2">Admin Panel</div>
            <h1 className="font-black text-3xl text-white">
              Complaints Management
            </h1>
          </div>
          <button onClick={loadComplaints}
            className="btn-secondary text-sm py-2 px-4">
            🔄 Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { icon: "📋", label: "Total",      value: complaints.length,                                            color: "text-white"      },
            { icon: "🔴", label: "Escalated",  value: complaints.filter(c => c.status === "escalated").length,      color: "text-red-400"    },
            { icon: "🟡", label: "Open",       value: complaints.filter(c => c.status === "open").length,           color: "text-yellow-400" },
            { icon: "🔍", label: "In Progress",value: complaints.filter(c => c.status === "investigating").length,  color: "text-purple-400" },
            { icon: "✅", label: "Resolved",   value: complaints.filter(c => c.status === "resolved").length,       color: "text-lime-400"   },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`font-black text-2xl mb-1 ${s.color}`}>
                {s.value}
              </div>
              <div className="text-gw-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["escalated","all","open","investigating","resolved","dismissed"].map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold
                capitalize transition-all
                ${filter === f
                  ? "bg-lime-400 text-gw-950"
                  : "bg-gw-900 text-gw-400 hover:text-white"
                }`}>
              {f.replace(/_/g, " ")}
              {f === "escalated" && complaints.filter(c =>
                c.status === "escalated").length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs
                                 rounded-full px-1.5 py-0.5">
                  {complaints.filter(c => c.status === "escalated").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <p className="text-gw-400 text-center py-12">Loading...</p>
        ) : complaints.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gw-400">No complaints found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {complaints.map(c => (
              <div key={c._id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className={`text-xs font-bold
                        ${PRIORITY_COLORS[c.priority]}`}>
                        ● {c.priority}
                      </span>
                      <span style={{ border: "1px solid" }}
                        className={`text-xs px-2 py-0.5 rounded-lg
                          capitalize ${STATUS_COLORS[c.status] || ""}`}>
                        {c.status.replace(/_/g, " ")}
                      </span>
                      {c.agentVerdict && (
                        <span style={{ border: "1px solid #14532d" }}
                          className={`text-xs px-2 py-0.5 rounded-lg font-bold
                            ${c.agentVerdict === "guilty"
                              ? "text-red-400"
                              : c.agentVerdict === "not_guilty"
                              ? "text-lime-400" : "text-yellow-400"}`}>
                          Verdict: {c.agentVerdict.replace(/_/g, " ")}
                        </span>
                      )}
                      {c.leaderApproved && (
                        <span style={{ border: "1px solid #991b1b" }}
                          className="text-xs text-red-400 px-2 py-0.5
                                     rounded-lg bg-red-900/20 font-bold">
                          ⚠️ Leader escalated
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-white text-base mb-1">
                      {c.subject}
                    </h3>
                    <p className="text-gw-500 text-xs mb-1">
                      From: {c.complainantName} ({c.complainantRole})
                      {c.againstName && ` → Against: ${c.againstName}`}
                    </p>
                    <p className="text-gw-600 text-xs">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelected(c);
                      setAdminAction(c.adminAction || "");
                      setAdminNotes(c.adminNotes || "");
                      setResolution("");
                      setError("");
                    }}
                    className="btn-secondary text-xs py-2 px-4 shrink-0">
                    Take Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center
                          justify-center bg-black/70 px-4 py-8
                          overflow-y-auto">
            <div style={{ border: "1px solid #14532d" }}
              className="bg-gw-950 rounded-2xl p-6 max-w-2xl
                         w-full my-auto">

              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-white text-xl">
                  Admin Action
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

                {/* Complaint summary */}
                <div style={{ border: "1px solid #14532d" }}
                  className="bg-gw-900/30 rounded-xl px-4 py-3">
                  <p className="text-white font-bold text-sm mb-1">
                    {selected.subject}
                  </p>
                  <p className="text-gw-400 text-xs leading-relaxed">
                    {selected.description}
                  </p>
                </div>

                {/* Agent + Leader notes */}
                {(selected.agentNotes || selected.leaderNotes) && (
                  <div className="grid grid-cols-2 gap-3">
                    {selected.agentNotes && (
                      <div style={{ border: "1px solid #14532d" }}
                        className="bg-gw-900/30 rounded-xl px-3 py-3">
                        <p className="text-gw-500 text-xs mb-1">
                          Agent Notes
                        </p>
                        <p className="text-white text-xs leading-relaxed">
                          {selected.agentNotes}
                        </p>
                        {selected.agentVerdict && (
                          <p className={`text-xs font-bold mt-2
                            ${selected.agentVerdict === "guilty"
                              ? "text-red-400"
                              : selected.agentVerdict === "not_guilty"
                              ? "text-lime-400" : "text-yellow-400"}`}>
                            Verdict: {selected.agentVerdict.replace(/_/g," ")}
                          </p>
                        )}
                      </div>
                    )}
                    {selected.leaderNotes && (
                      <div style={{ border: "1px solid #14532d" }}
                        className="bg-gw-900/30 rounded-xl px-3 py-3">
                        <p className="text-gw-500 text-xs mb-1">
                          Leader Notes
                        </p>
                        <p className="text-white text-xs leading-relaxed">
                          {selected.leaderNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

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

                {/* Admin action selection */}
                <div>
                  <label className="label">Select Action *</label>
                  <div className="flex flex-col gap-2">
                    {ADMIN_ACTIONS.map(action => (
                      <button key={action.key} type="button"
                        onClick={() => setAdminAction(action.key)}
                        style={{
                          border: `2px solid ${adminAction === action.key
                            ? action.color : "#14532d"}`,
                          background: adminAction === action.key
                            ? `${action.color}10` : "transparent",
                        }}
                        className="flex items-center gap-3 px-4 py-3
                                   rounded-xl text-left transition-all">
                        <span style={{
                          color: adminAction === action.key
                            ? action.color : "#4a7c59",
                          fontSize: "13px", fontWeight: 700,
                        }}>
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin notes */}
                <div>
                  <label className="label">Admin Notes</label>
                  <textarea
                    className="input min-h-[80px] resize-none"
                    placeholder="Add your decision notes..."
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                  />
                </div>

                {/* Resolution message */}
                <div>
                  <label className="label">
                    Resolution Message (sent to complainant)
                  </label>
                  <textarea
                    className="input min-h-[80px] resize-none"
                    placeholder="What will the complainant be told about the resolution?"
                    value={resolution}
                    onChange={e => setResolution(e.target.value)}
                  />
                </div>

                <button
                  className="btn-primary w-full"
                  onClick={handleAdminAction}
                  disabled={acting}>
                  {acting ? "Processing..." : "Confirm Action →"}
                </button>

              </div>
            </div>
          </div>
        )}

      </section>
    </main>
  );
}