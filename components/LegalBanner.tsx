"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function LegalBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("gw-legal-seen");
    if (!seen) setVisible(true);
  }, []);

  function handleAccept() {
    localStorage.setItem("gw-legal-seen", "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <div
        style={{ border: "1px solid #14532d" }}
        className="max-w-4xl mx-auto bg-gw-950 rounded-2xl p-5
                   shadow-2xl shadow-black/60">

        <div className="flex flex-col md:flex-row items-start
                        md:items-center gap-4">

          {/* Icon + Text */}
          <div className="flex items-start gap-3 flex-1">
            <span className="text-2xl shrink-0">📋</span>
            <div>
              <p className="font-bold text-white text-sm mb-1">
                Before you continue — How GreenWheels Works
              </p>
              <p className="text-gw-400 text-xs leading-relaxed">
                GreenWheels collects payment <strong className="text-white">
                only after on-site verification passes</strong> — never before.
                If your vehicle fails verification, your order is cancelled and
                <strong className="text-white"> zero rupees are charged</strong>.
                All dealers are admin-verified before going live.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <Link
              href="/legal"
              target="_blank"
              className="btn-secondary text-xs py-2 px-4 text-center w-full md:w-auto">
              Read Full Legal Process
            </Link>
            <button
              onClick={handleAccept}
              className="btn-primary text-xs py-2 px-4 w-full md:w-auto">
              I Understand ✓
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}