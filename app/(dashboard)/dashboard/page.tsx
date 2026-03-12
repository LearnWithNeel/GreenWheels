import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="page-wrapper">
      <section className="section max-w-4xl mx-auto text-center">
        <div className="badge-green inline-block mb-4">My Dashboard</div>
        <h1 className="font-black text-4xl text-white mb-4">
          Welcome to GreenWheels 🌿
        </h1>
        <p className="text-gw-300 text-lg mb-8">
          Your dashboard is being built — coming in Week 7.
        </p>
        <Link href="/retrofit" className="btn-primary text-base py-4 px-8">
          Start a Retrofit Inquiry →
        </Link>
      </section>
    </main>
  );
}