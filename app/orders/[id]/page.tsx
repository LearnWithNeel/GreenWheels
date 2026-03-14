import Link from "next/link";

export default function OrderPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="page-wrapper min-h-screen flex items-center
                     justify-center">
      <section className="text-center max-w-lg mx-auto px-4">

        <div className="text-6xl mb-6">🎉</div>

        <div className="badge-green inline-block mb-4">
          Order Submitted
        </div>

        <h1 className="font-black text-3xl text-white mb-4">
          Inquiry Received Successfully!
        </h1>

        <p className="text-gw-400 text-sm leading-relaxed mb-2">
          Your retrofit inquiry has been submitted. Our admin-verified
          dealers in your area will be notified shortly.
        </p>

        <p className="text-gw-600 text-xs mb-8 font-mono">
          Order ID: {params.id}
        </p>

        <div style={{ border: "1px solid #14532d" }}
          className="bg-gw-900/30 rounded-xl px-4 py-3 mb-8 text-left">
          <p className="text-gw-400 text-xs leading-relaxed">
            <span className="text-white font-semibold">⚠️ Remember: </span>
            No payment has been collected yet. Payment is only requested
            after on-site verification passes. You will receive updates
            on your registered email.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/dashboard" className="btn-primary w-full">
            Go to My Dashboard
          </Link>
          <Link href="/retrofit" className="btn-secondary w-full">
            Submit Another Inquiry
          </Link>
        </div>

      </section>
    </main>
  );
}