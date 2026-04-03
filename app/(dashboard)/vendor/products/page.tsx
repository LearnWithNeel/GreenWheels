"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type Product = {
  _id:        string;
  name:       string;
  brand:      string;
  category:   string;
  price:      number;
  mrp:        number;
  stock:      number;
  isApproved: boolean;
  isActive:   boolean;
  araiApproved: boolean;
  createdAt:  string;
};

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    try {
      const res  = await fetch("/api/vendor/products");
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch {}
    finally { setLoading(false); }
  }

  return (
    <main className="page-wrapper">
      <section className="section max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="badge-green inline-block mb-2">My Products</div>
            <h1 className="font-black text-3xl text-white">
              Product Listings
            </h1>
          </div>
          <Link href="/vendor/products/add"
            className="btn-primary text-sm py-2 px-4">
            + Add Product
          </Link>
        </div>

        {loading ? (
          <p className="text-gw-400 text-center py-12">Loading...</p>
        ) : products.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="font-black text-white text-lg mb-2">
              No products yet
            </h3>
            <p className="text-gw-400 text-sm mb-6">
              Add your first product to start selling.
            </p>
            <Link href="/vendor/products/add" className="btn-primary">
              Add Product →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {products.map(product => (
              <div key={product._id} className="card">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-black text-white text-base">
                        {product.name}
                      </h3>
                      <span style={{ border: "1px solid #14532d" }}
                        className="text-xs text-gw-400 px-2 py-0.5
                                   rounded-lg bg-gw-900">
                        {product.brand}
                      </span>
                      {product.araiApproved && (
                        <span style={{ border: "1px solid #14532d" }}
                          className="text-xs text-lime-400 px-2 py-0.5
                                     rounded-lg bg-gw-900">
                          ✅ ARAI
                        </span>
                      )}
                      <span style={{
                        border: `1px solid ${product.isApproved
                          ? "#14532d" : "#d97706"}`,
                      }}
                        className={`text-xs px-2 py-0.5 rounded-lg
                          font-bold ${product.isApproved
                            ? "text-lime-400 bg-lime-900/20"
                            : "text-yellow-400 bg-yellow-900/20"
                          }`}>
                        {product.isApproved ? "✅ Live" : "⏳ Pending Review"}
                      </span>
                    </div>
                    <p className="text-gw-500 text-xs">
                      {product.category} ·
                      ₹{product.price.toLocaleString()} ·
                      Stock: {product.stock}
                    </p>
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