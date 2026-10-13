"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useOpxStore } from "@/store/use-opx-store";

export function HeaderNav() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const opxBalance = useOpxStore((s) => s.balance);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
            OP
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
              Only<span className="text-emerald-600">Pays</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono -mt-1 uppercase tracking-wider">
              Creator Hub
            </span>
          </div>
        </Link>

        {/* Center Opx Badge (Powered by Zustand Opx Store) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-mono">{opxBalance} Opx</span>
          <span className="text-amber-500 font-normal">| Wallet Balance</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/protected"
            className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Protected Page
          </Link>

          {isLoading ? (
            <div className="w-20 h-8 bg-slate-100 animate-pulse rounded-lg" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || "User"}
                    className="w-8 h-8 rounded-full border border-emerald-300 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                    {(user.name || user.email || "U").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                  {user.name || user.email}
                </span>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors"
              >
                Log Out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm hover:shadow transition-all font-semibold"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
