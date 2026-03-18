"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Complaint = {
  _id:             string;
  complainantName: string;
  complainantEmail:string;
  type:            string;
  against:         string;
  againstName:     string;
  subject:         string;
  description:     string;
  status:          string;
  priority:        string;
  agentNotes:      string;
  agentVerdict?:   string;
  leaderNotes:     string;
  leaderApproved?: boolean;
  evidence:        string[];
  declarationAccepted: boolean;
  orderVerified:   boolean;
  createdAt:       string;
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

export default function LeaderDashboardPage() {
  const router = useRouter();
  const [user, setUser]               = useState<{name:string;email:string;role:string}|null>(null);
  const [complaints, setComplaints]   = useState<Complaint[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<Complaint | null>(null);
  const [leaderNotes, setLeaderNotes] = useState("");
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const [filter, setFilter]           = useState("all");

  useEffect(() => { checkAuth(); }, []);
  useEffect(() => { if (user) loadComplaints(); }, [filter, user]);

  async function checkAuth() {
    try {
      const res  = await fetch("/api/support/auth/me");
      const data = await res.json();
      if (!data.success || data.user.role !== "support_leader") {
        router.push("/support-portal/login"); return;
      }
      setUser(data.user);
    } catch { router.push("/support-portal/login"); }
  }

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

  async function handleLeaderAction(approve: boolean) {
    if (!selected) return;
    setSaving(true); setError("");
    try {
      const res  = await fetch(`/api/complaints/${selected._id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          leaderNotes,
          leaderApproved: approve,
          status: approve ? "escalated" : "resolved",
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setSelected(null);
      loadComplaints();
    } catch { setError("Something went wrong."); }
    finally { setSaving(false); }
  }

  async function handleLogout() {
    await fetch("/api/support/auth", { method: "DELETE" });
    router.push("/support-portal/login");
  }

  const filtered = filter === "all"
    ? complaints
    : complaints.filter(c => c.status === filter);

  return (
    <main className="min-h-screen bg-gw-950">

      {/* Navbar */}
      <nav style={{ borderBottom: "1px solid #14532d" }}
        className="bg-gw-950 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">👑</span>
          <div>
            <p className="text-white font-black text-sm">Support Portal</p>
            <p className="text-gw-600 text-xs">Leader Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div style={{ border: "1px solid #14532d" }}
            className="px-3 py-2 rounded-xl">
            <p className="text-white text-xs font-bold">{user?.name}</p>
            <p className="text-gw-600 text-xs">Support Leader</p>
          </div>
          <button onClick={handleLogout}
            className="text-red-400 text-xs hover:text-red-300 transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { icon: "📋", label: "Total",        value: complaints.length,                                               color: "text-white"         },
            { icon: "🟡", label: "Open",         value: complaints.filter(c => c.status === "open").length,              color: "text-yellow-400"    },
            { icon: "🔍", label: "Investigating", value: complaints.filter(c => c.status === "investigating").length,    color: "text-purple-400"    },
            { icon: "🔴", label: "Escalated",    value: complaints.filter(c => c.status === "escalated").length,         color: "text-red-400"       },
            { icon: "✅", label: "Resolved",     value: complaints.filter(c => c.status === "resolved").length,          color: "text-lime-400"      },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`font-black text-2xl mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-gw-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Daily Report Box */}
        <div style={{ border: "1px solid #14532d" }}
          className="bg-gw-900/20 rounded-2xl p-5 mb-6">
          <h3 className="font-black text-white text-lg mb-3">
            📊 Daily Summary for Admin
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              { label: "New today",     value: complaints.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length },
              { label: "Pending agent verdict", value: complaints.filter(c => c.status === "investigating" && !c.agentVerdict).length },
              { label: "Awaiting leader review", value: complaints.filter(c => c.agentVerdict && c.leaderApproved === undefined).length },
              { label: "Escalated to admin", value: complaints.filter(c => c.status === "escalated").length },
            ].map(item => (
              <div key={item.label}
                style={{ border: "1px solid #14532d" }}
                className="bg-gw-900/30 rounded-xl px-3 py-3 text-center">
                <p className="font-black text-2xl text-white mb-1">{item.value}</p>
                <p className="text-gw-500 text-xs">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {["all","open","under_review","investigating","escalated","resolved"].map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold
                capitalize transition-all
                ${filter === f
                  ? "bg-lime-400 text-gw-950"
                  : "bg-gw-900 text-gw-400 hover:text-white"
                }`}>
              {f.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Complaints */}
        {loading ? (
          <p className="text-gw-400 text-center py-12">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gw-400">No complaints found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(c => (
              <div key={c._id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className={`text-xs font-bold ${PRIORITY_COLORS[c.priority]}`}>
                        ● {c.priority}
                      </span>
                      <span style={{ border: "1px solid" }}
                        className={`text-xs px-2 py-0.5 rounded-lg capitalize
                          ${STATUS_COLORS[c.status] || ""}`}>
                        {c.status.replace(/_/g, " ")}
                      </span>
                      {c.agentVerdict && (
                        <span style={{ border: "1px solid #14532d" }}
                          className={`text-xs px-2 py-0.5 rounded-lg font-bold
                            ${c.agentVerdict === "guilty"
                              ? "text-red-400" : c.agentVerdict === "not_guilty"
                              ? "text-lime-400" : "text-yellow-400"}`}>
                          Agent: {c.agentVerdict.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-white text-base mb-1">
                      {c.subject}
                    </h3>
                    <p className="text-gw-500 text-xs">
                      From: {c.complainantName}
                      {c.againstName && ` → Against: ${c.againstName}`}
                    </p>
                  </div>
                  <button onClick={() => {
                    setSelected(c);
                    setLeaderNotes(c.leaderNotes || "");
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
        <div className="fixed inset-0 z-50 flex items-center justify-center
                        bg-black/70 px-4 py-8 overflow-y-auto">
          <div style={{ border: "1px solid #14532d" }}
            className="bg-gw-950 rounded-2xl p-6 max-w-2xl w-full my-auto">

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-white text-xl">
                Leader Review
              </h2>
              <button onClick={() => setSelected(null)}
                className="text-gw-500 hover:text-white text-xl">✕</button>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700/50
                              text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4">

              {/* Complaint summary */}
              <div style={{ border: "1px solid #14532d" }}
                className="bg-gw-900/30 rounded-xl px-4 py-3">
                <p className="text-gw-500 text-xs mb-1">Subject</p>
                <p className="text-white font-bold text-sm mb-2">
                  {selected.subject}
                </p>
                <p className="text-gw-400 text-xs leading-relaxed">
                  {selected.description}
                </p>
              </div>

              {/* Agent notes + verdict */}
              {selected.agentNotes && (
                <div style={{ border: "1px solid #14532d" }}
                  className="bg-gw-900/30 rounded-xl px-4 py-3">
                  <p className="text-gw-500 text-xs mb-1">Agent Notes</p>
                  <p className="text-white text-sm leading-relaxed">
                    {selected.agentNotes}
                  </p>
                  {selected.agentVerdict && (
                    <div className="mt-2">
                      <span className="text-gw-500 text-xs">
                        Agent Verdict:{" "}
                      </span>
                      <span className={`text-xs font-bold ${
                        selected.agentVerdict === "guilty"
                          ? "text-red-400"
                          : selected.agentVerdict === "not_guilty"
                          ? "text-lime-400"
                          : "text-yellow-400"
                      }`}>
                        {selected.agentVerdict.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Leader notes */}
              <div>
                <label className="label">Your Notes & Recommendation</label>
                <textarea
                  className="input min-h-[100px] resize-none"
                  placeholder="Add your review notes and recommendation for admin..."
                  value={leaderNotes}
                  onChange={e => setLeaderNotes(e.target.value)}
                />
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleLeaderAction(true)}
                  disabled={saving}
                  className="btn-primary py-3">
                  {saving ? "Processing..." : "🔴 Escalate to Admin"}
                </button>
                <button
                  onClick={() => handleLeaderAction(false)}
                  disabled={saving}
                  style={{ border: "1px solid #14532d" }}
                  className="py-3 rounded-xl text-lime-400 font-bold
                             hover:bg-gw-900 transition-all text-sm">
                  {saving ? "Processing..." : "✅ Resolve & Close"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </main>
  );
}