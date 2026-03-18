"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  DUMMY_PRODUCTS, CATEGORIES, BRANDS, VEHICLES,
  type Product,
} from "@/lib/dummyProducts";

const SHOP_MODE = process.env.NEXT_PUBLIC_SHOP_MODE || "dummy";

const SORT_OPTIONS = [
  { key: "popular",   label: "Most Popular"   },
  { key: "price_asc", label: "Price: Low → High" },
  { key: "price_desc",label: "Price: High → Low" },
  { key: "rating",    label: "Top Rated"      },
];

function formatPrice(p: number) {
  return "₹" + p.toLocaleString("en-IN");
}

function ProductCard({ product }: { product: Product }) {
  const discount = Math.round((1 - product.price / product.mrp) * 100);

  return (
    <div style={{ border: "1px solid #14532d" }}
      className="bg-gw-900/30 rounded-2xl overflow-hidden
                 hover:border-lime-700/50 transition-all group">

      {/* Image */}
      <div className="relative overflow-hidden h-48 bg-gw-900">
        <img src={product.image} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105
                     transition-transform duration-300"/>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.araiApproved && (
            <span style={{ background: "#052e16", border: "1px solid #14532d" }}
              className="text-xs text-lime-400 px-2 py-0.5 rounded-lg
                         font-bold">
              ✅ ARAI
            </span>
          )}
          {!product.inStock && (
            <span style={{ background: "#1a0505", border: "1px solid #991b1b" }}
              className="text-xs text-red-400 px-2 py-0.5 rounded-lg font-bold">
              Out of Stock
            </span>
          )}
        </div>

        {discount > 0 && (
          <div className="absolute top-3 right-3"
            style={{ background: "#a3e635", borderRadius: "8px",
                     padding: "2px 8px" }}>
            <span className="text-xs font-black text-gw-950">
              -{discount}%
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span style={{ border: "1px solid #14532d" }}
            className="text-xs text-gw-500 px-2 py-0.5 rounded-lg
                       bg-gw-900 capitalize">
            {product.brand}
          </span>
          <span className="text-gw-600 text-xs capitalize">
            {product.vehicle.join(", ")}
          </span>
        </div>

        <h3 className="font-black text-white text-sm mb-1 leading-snug
                       group-hover:text-lime-400 transition-colors">
          {product.name}
        </h3>

        <p className="text-gw-500 text-xs leading-relaxed mb-3 line-clamp-2">
          {product.desc}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {"★".repeat(Math.round(product.rating))}
            <span className="text-gw-600 text-xs">
              {"☆".repeat(5 - Math.round(product.rating))}
            </span>
          </div>
          <span className="text-lime-400 text-xs font-bold">
            {product.rating}
          </span>
          <span className="text-gw-600 text-xs">
            ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <div className="font-black text-xl text-white">
              {formatPrice(product.price)}
            </div>
            {product.mrp > product.price && (
              <div className="text-gw-600 text-xs line-through">
                {formatPrice(product.mrp)}
              </div>
            )}
          </div>
          <button
            disabled={!product.inStock}
            className={`text-xs font-bold px-3 py-2 rounded-xl
              transition-all
              ${product.inStock
                ? "bg-lime-400 text-gw-950 hover:bg-lime-300"
                : "bg-gw-800 text-gw-600 cursor-not-allowed"
              }`}>
            {product.inStock ? "Add to Cart" : "Sold Out"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {

  const [category, setCategory] = useState("all");
  const [brand, setBrand]       = useState("All Brands");
  const [vehicle, setVehicle]   = useState("All Vehicles");
  const [sort, setSort]         = useState("popular");
  const [search, setSearch]     = useState("");

  const filtered = useMemo(() => {
    let p = [...DUMMY_PRODUCTS];

    if (search)               p = p.filter(x =>
      x.name.toLowerCase().includes(search.toLowerCase()) ||
      x.brand.toLowerCase().includes(search.toLowerCase())
    );
    if (category !== "all")   p = p.filter(x => x.category === category);
    if (brand !== "All Brands")   p = p.filter(x => x.brand === brand);
    if (vehicle !== "All Vehicles") p = p.filter(x =>
      x.vehicle.includes(vehicle as "car" | "bike" | "auto")
    );

    if (sort === "price_asc")  p.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") p.sort((a, b) => b.price - a.price);
    if (sort === "rating")     p.sort((a, b) => b.rating - a.rating);
    if (sort === "popular")    p.sort((a, b) => b.reviews - a.reviews);

    return p;
  }, [category, brand, vehicle, sort, search]);

  // ── Live mode — show vendor CTA ──
  if (SHOP_MODE === "live") {
    return (
      <main className="page-wrapper">
        <section className="section max-w-4xl mx-auto text-center py-24">
          <div className="text-6xl mb-6">🛒</div>
          <div className="badge-green inline-block mb-4">Shop</div>
          <h1 className="font-black text-4xl text-white mb-4">
            EV Parts & Accessories
          </h1>
          <p className="text-gw-400 text-lg max-w-xl mx-auto mb-8">
            Our verified vendor marketplace is launching soon.
            Are you an EV parts supplier? Register as a vendor and
            start selling to thousands of retrofit customers.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/vendor/register"
              className="btn-primary text-base py-4 px-8">
              Register as Vendor →
            </Link>
            <Link href="/franchise"
              className="btn-secondary text-base py-4 px-8">
              Learn More
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-wrapper">
      <section className="section max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="badge-green inline-block mb-3">Shop</div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-black text-4xl text-white mb-2">
                EV Parts & Accessories
              </h1>
              <p className="text-gw-400 text-sm">
                ARAI approved kits, batteries, motors and accessories
                from verified brands.
              </p>
            </div>
            <div style={{ border: "1px solid #14532d" }}
              className="bg-gw-900/30 rounded-xl px-4 py-2 text-center
                         shrink-0">
              <p className="text-lime-400 font-black text-lg">
                {filtered.length}
              </p>
              <p className="text-gw-500 text-xs">Products</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2
                           text-gw-500">
            🔍
          </span>
          <input
            className="input pl-10"
            placeholder="Search products, brands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl
                text-sm font-bold whitespace-nowrap transition-all
                ${category === cat.key
                  ? "bg-lime-400 text-gw-950"
                  : "bg-gw-900 text-gw-400 hover:text-white"
                }`}>
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Brand + Vehicle + Sort */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <select className="input py-2 text-sm w-auto"
            value={brand}
            onChange={e => setBrand(e.target.value)}>
            {BRANDS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select className="input py-2 text-sm w-auto"
            value={vehicle}
            onChange={e => setVehicle(e.target.value)}>
            {VEHICLES.map(v => (
              <option key={v} value={v} className="capitalize">
                {v === "All Vehicles" ? v
                 : v === "car" ? "🚗 Car"
                 : v === "bike" ? "🏍️ Bike"
                 : "🛺 Auto"}
              </option>
            ))}
          </select>

          <select className="input py-2 text-sm w-auto"
            value={sort}
            onChange={e => setSort(e.target.value)}>
            {SORT_OPTIONS.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-black text-white text-lg mb-2">
              No products found
            </h3>
            <p className="text-gw-400 text-sm mb-4">
              Try adjusting your filters or search query.
            </p>
            <button
              onClick={() => {
                setCategory("all");
                setBrand("All Brands");
                setVehicle("All Vehicles");
                setSearch("");
              }}
              className="btn-secondary text-sm py-2 px-4">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2
                          lg:grid-cols-3 gap-6">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Vendor CTA */}
        <div style={{ border: "1px solid #14532d" }}
          className="bg-gw-900/20 rounded-2xl p-6 mt-12 text-center">
          <h2 className="font-black text-white text-xl mb-2">
            Are you an EV parts supplier? 🏭
          </h2>
          <p className="text-gw-400 text-sm mb-4 max-w-xl mx-auto">
            Register as a verified vendor and sell your ARAI approved
            products to thousands of retrofit customers and dealers
            across India.
          </p>
          <Link href="/vendor/register"
            className="btn-primary text-sm py-3 px-6">
            Become a Vendor →
          </Link>
        </div>

      </section>
    </main>
  );
}