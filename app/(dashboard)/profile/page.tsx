"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CustomerProfilePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/customer/profile");
                const data = await res.json();
                if (data.success && data.user) {
                    setForm({
                        name: data.user.name || "",
                        phone: data.user.phone || "",
                        address: data.user.address?.street || "",
                        city: data.user.address?.city || "",
                        state: data.user.address?.state || "",
                        pincode: data.user.address?.pincode || "",
                    });
                }
            } catch { }
            finally { setLoading(false); }
        }
        if (session) load();
    }, [session]);

    async function handleSave() {
        setSaving(true); setError(""); setSuccess("");
        try {
            const res = await fetch("/api/customer/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!data.success) { setError(data.message); return; }
            setSuccess("Profile updated successfully!");
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

                <div className="mb-8">
                    <div className="badge-green inline-block mb-3">My Profile</div>
                    <h1 className="font-black text-3xl text-white mb-1">
                        Account Settings
                    </h1>
                    <p className="text-gw-400 text-sm">
                        Update your personal information.
                    </p>
                </div>

                <div className="card flex flex-col gap-4">

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

                    {/* Account Info — readonly */}
                    <div style={{ border: "1px solid #14532d" }}
                        className="bg-gw-900/30 rounded-xl px-4 py-3">
                        <p className="text-gw-500 text-xs mb-1">Email Address</p>
                        <p className="text-white font-semibold">
                            {session?.user?.email}
                        </p>
                        <p className="text-gw-700 text-xs mt-1">
                            Email cannot be changed.
                        </p>
                    </div>

                    {/* Editable fields */}
                    <div>
                        <label className="label">Full Name</label>
                        <input className="input" placeholder="Your full name"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>

                    <div>
                        <label className="label">Phone Number</label>
                        <input className="input" type="tel"
                            placeholder="10-digit mobile number"
                            maxLength={10}
                            value={form.phone}
                            onChange={e => setForm({
                                ...form,
                                phone: e.target.value.replace(/\D/g, "").slice(0, 10)
                            })} />
                    </div>

                    <div>
                        <label className="label">Street Address</label>
                        <input className="input"
                            placeholder="Street / Area / Locality"
                            value={form.address}
                            onChange={e => setForm({ ...form, address: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="label">City</label>
                            <input className="input" placeholder="City"
                                value={form.city}
                                onChange={e => setForm({ ...form, city: e.target.value })} />
                        </div>
                        <div>
                            <label className="label">State</label>
                            <input className="input" placeholder="State"
                                value={form.state}
                                onChange={e => setForm({ ...form, state: e.target.value })} />
                        </div>
                        <div>
                            <label className="label">Pincode</label>
                            <input className="input" placeholder="6-digit"
                                maxLength={6}
                                value={form.pincode}
                                onChange={e => setForm({
                                    ...form,
                                    pincode: e.target.value.replace(/\D/g, "").slice(0, 6)
                                })} />
                        </div>
                    </div>

                    <button className="btn-primary w-full mt-2"
                        onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes →"}
                    </button>

                </div>

            </section>
        </main>
    );
}