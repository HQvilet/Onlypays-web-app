"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/use-auth-store";

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="flex-1 bg-slate-50 flex flex-col justify-between py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Axios + TanStack Query + Zustand Client Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Exclusive Media Platform <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500">
              Powered by Opux (Opx)
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600">
            Monetize creator content, manage paid subscriptions, and unlock digital marketplace collections with client-side TanStack Query, Axios, and Zustand state.
          </p>

          {/* User Call to Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated && user ? (
              <Link
                href="/protected"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-emerald-600/20 transition-all text-base flex items-center justify-center gap-2"
              >
                <span>View Session ({user.name || user.email})</span>
                <span className="text-emerald-200 font-mono text-sm">&rarr;</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-emerald-600/20 transition-all text-base text-center"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded-2xl shadow-sm transition-colors text-base text-center"
                >
                  Create Account
                </Link>
                <Link
                  href="/protected"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl shadow-sm transition-colors text-base flex items-center justify-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Test Protected Page
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl mb-4">
              ⚡
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">
              Axios & TanStack Query
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              100% client-side data fetching with automatic caching, background revalidation, retry policies, and request correlation IDs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl mb-4">
              🐻
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">
              Zustand State Stores
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lightweight reactive stores for persistent authentication, Opx token balances with optimistic updates, modals, and toasts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xl mb-4">
              🛡️
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">
              Pure Client Architecture
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Zero Next.js server-side data fetching. All queries and mutations originate from the client and talk to Envoy Gateway and BFF routes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
