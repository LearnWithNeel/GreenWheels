"use client";
import { useState, useEffect } from "react";
import LoadingDots from "@/components/LoadingDots";

type SupportUser = {
  _id:           string;
  name:          string;
  email:         string;
  role:          string;
  phone:         string;
  isActive:      boolean;
  totalResolved: number;
  createdAt:     string;
};

export default function AdminSupportUsersPage() {
  const [users, setUsers]   = useState<SupportUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating]     = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");

  const [form, setForm] = useState({
    name:        "",
    email:       "",
    password:    "",
    supportRole: "support_agent",
    phone:       "",
  });

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      const res  = await fetch("/api/admin/support-users");
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch {}
    finally { setLoading(false); }
  }

  async function handleCreate() {
    setError(""); setCreating(true);
    try {
      if (!form.name || !form.email || !form.password) {
        setError("Name, email and password are required."); return;
      }
      const res  = await fetch("/api/admin/support-users", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setSuccess(data.message);
      setShowCreate(false);
      setForm({ name:"", email:"", password:"", supportRole:"support_agent", phone:"" });
      loadUsers();
    } catch { setError("Something went wrong."); }
    finally { setCreating(false); }
  }

  async function handleDeactivate(userId: string) {
    if (!confirm("Deactivate this support user?")) return;
    try {
      await fetch("/api/admin/support-users", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId }),
      });
      loadUsers();
    } catch {}
  }

  return (
    <main className="page-wrapper">
      <section className="section max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="badge-green inline-block mb-2">Admin Panel</div>
            <h1 className="font-black text-3xl text-white">
              Support Team
            </h1>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="btn-primary text-sm py-2 px-4">
            + Add Member
          </button>
        </div>

        {success && (
          <div className="bg-gw-900/50 border border-lime-700/50
                          text-lime-400 text-sm rounded-xl
                          px-4 py-3 mb-6">
            {success}
          </div>
        )}

        {/* Create form */}
        {showCreate && (
          <div style={{ border: "1px solid #14532d" }}
            className="bg-gw-900/30 rounded-2xl p-5 mb-6">
            <h3 className="font-black text-white text-lg mb-4">
              Create Support Member
            </h3>

            {error && (
              <div className="bg-red-900/30 border border-red-700/50
                              text-red-400 text-sm rounded-xl
                              px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Full Name *</label>
                <input className="input" placeholder="Full name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}/>
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" placeholder="Phone number"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}/>
              </div>
              <div>
                <label className="label">Email *</label>
                <input className="input" type="email"
                  placeholder="email@greenwheels.in"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}/>
              </div>
              <div>
                <label className="label">Password *</label>
                <input className="input" type="password"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={e => setForm({
                    ...form, password: e.target.value
                  })}/>
              </div>
              <div className="col-span-2">
                <label className="label">Role *</label>
                <div className="flex gap-3">
                  {[
                    { key: "support_agent",  label: "👤 Support Agent",  desc: "Handles individual complaints" },
                    { key: "support_leader", label: "👑 Support Leader", desc: "Reviews agents, reports to admin" },
                  ].map(r => (
                    <button key={r.key} type="button"
                      onClick={() => setForm({ ...form, supportRole: r.key })}
                      style={{
                        border: `2px solid ${form.supportRole === r.key
                          ? "#a3e635" : "#14532d"}`,
                        background: form.supportRole === r.key
                          ? "#a3e63510" : "transparent",
                      }}
                      className="flex-1 rounded-xl p-3 text-left
                                 transition-all">
                      <p className={`font-bold text-sm mb-0.5 ${
                        form.supportRole === r.key
                          ? "text-lime-400" : "text-white"
                      }`}>
                        {r.label}
                      </p>
                      <p className="text-gw-500 text-xs">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Portal URL info */}
            <div style={{ border: "1px solid #14532d" }}
              className="bg-gw-900/30 rounded-xl px-4 py-3 mb-4">
              <p className="text-gw-400 text-xs leading-relaxed">
                <span className="text-white font-bold">
                  🔒 Portal URL:{" "}
                </span>
                Share this secret URL with the new member:
                <span className="text-lime-400 font-mono ml-1">
                  {typeof window !== "undefined"
                    ? window.location.origin
                    : "https://greenwheels.in"}
                  /support-portal/login
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <button className="btn-primary flex-1"
                onClick={handleCreate} disabled={creating}>
                {creating
                  ? <><span>Creating</span> <LoadingDots /></>
                  : "Create Member →"
                }
              </button>
              <button
                className="btn-secondary px-6"
                onClick={() => setShowCreate(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Users list */}
        {loading ? (
          <p className="text-gw-400 text-center py-12">Loading...</p>
        ) : users.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-gw-400 text-sm">
              No support team members yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {users.map(user => (
              <div key={user._id} className="card">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div style={{ border: "1px solid #14532d" }}
                      className="w-12 h-12 rounded-full bg-gw-900
                                 flex items-center justify-center
                                 text-xl shrink-0">
                      {user.role === "support_leader" ? "👑" : "👤"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-white text-base">
                          {user.name}
                        </h3>
                        <span style={{ border: "1px solid #14532d" }}
                          className={`text-xs px-2 py-0.5 rounded-lg
                            font-bold ${user.isActive
                              ? "text-lime-400" : "text-red-400"}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-gw-500 text-xs">
                        {user.email} · {user.role.replace(/_/g, " ")}
                      </p>
                      <p className="text-gw-600 text-xs mt-0.5">
                        {user.totalResolved} complaints resolved
                      </p>
                    </div>
                  </div>
                  {user.isActive && (
                    <button
                      onClick={() => handleDeactivate(user._id)}
                      className="text-red-400 text-xs hover:text-red-300
                                 transition-colors">
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Also add leader can create agents info */}
        <div style={{ border: "1px solid #14532d" }}
          className="bg-gw-900/20 rounded-2xl p-5 mt-6">
          <h3 className="font-black text-white text-lg mb-2">
            📋 Team Structure
          </h3>
          <div className="flex flex-col gap-2 text-sm">
            {[
              "Admin creates Support Leader credentials from this page",
              "Support Leader creates Support Agent credentials from their portal",
              "All team members login via: /support-portal/login",
              "This URL is not shown anywhere on the public website",
              "Leader reports daily summary to admin",
              "Only escalated cases reach admin for final decision",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-lime-400 shrink-0">→</span>
                <span className="text-gw-400 text-xs">{item}</span>
              </div>
            ))}
          </div>
        </div>

      </section>
    </main>
  );
}