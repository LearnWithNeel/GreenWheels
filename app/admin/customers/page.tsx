"use client";
import { useState, useEffect } from "react";

type Customer = {
  _id:          string;
  name:         string;
  email:        string;
  phone:        string;
  emailVerified: boolean;
  isActive:     boolean;
  createdAt:    string;
  address?: {
    city:  string;
    state: string;
  };
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [total, setTotal]         = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => loadCustomers(), 400);
    return () => clearTimeout(timer);
  }, [search]);

  async function loadCustomers() {
    setLoading(true);
    try {
      const url = search
        ? `/api/admin/customers?search=${search}`
        : "/api/admin/customers";
      const res  = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
        setTotal(data.total);
      }
    } catch {}
    finally { setLoading(false); }
  }

  return (
    <main className="page-wrapper">
      <section className="section max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="badge-green inline-block mb-2">Admin Panel</div>
            <h1 className="font-black text-3xl text-white">
              Customer Management
            </h1>
          </div>
          <div style={{ border: "1px solid #14532d" }}
            className="bg-gw-900/30 rounded-xl px-4 py-2 text-center">
            <p className="text-lime-400 font-black text-xl">{total}</p>
            <p className="text-gw-500 text-xs">Total</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2
                           text-gw-500">
            🔍
          </span>
          <input className="input pl-10"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}/>
        </div>

        {loading ? (
          <p className="text-gw-400 text-center py-12">Loading...</p>
        ) : customers.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gw-400">No customers found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {customers.map(customer => (
              <div key={customer._id} className="card">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div style={{ border: "1px solid #14532d" }}
                      className="w-10 h-10 rounded-full bg-gw-900
                                 flex items-center justify-center
                                 font-black text-lime-400 shrink-0">
                      {customer.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-white text-base">
                          {customer.name}
                        </h3>
                        {customer.emailVerified ? (
                          <span style={{ border: "1px solid #14532d" }}
                            className="text-xs text-lime-400 px-2 py-0.5
                                       rounded-lg bg-gw-900">
                            ✓ Verified
                          </span>
                        ) : (
                          <span style={{ border: "1px solid #991b1b" }}
                            className="text-xs text-red-400 px-2 py-0.5
                                       rounded-lg bg-red-900/20">
                            Unverified
                          </span>
                        )}
                      </div>
                      <p className="text-gw-500 text-xs">
                        {customer.email}
                        {customer.phone && ` · ${customer.phone}`}
                      </p>
                      {customer.address?.city && (
                        <p className="text-gw-600 text-xs mt-0.5">
                          {customer.address.city}, {customer.address.state}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-gw-600 text-xs shrink-0">
                    {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </section>
    </main>
  );
}