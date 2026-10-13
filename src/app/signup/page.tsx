"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignupMutation, useLogout } from "@/hooks/use-auth-mutations";
import { useAuthStore } from "@/store/use-auth-store";
import { useAuth } from "@/context/auth-context";

export default function SignUpPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useLogout();
  const { loginWithGoogle } = useAuth();

  const signupMutation = useSignupMutation();

  const [role, setRole] = useState<"creator" | "subscriber">("creator");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [clientError, setClientError] = useState<string | null>(null);

  const handleCustomSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!email || !password) {
      setClientError("Please enter both an email address and a password.");
      return;
    }

    if (password.length < 8) {
      setClientError("Password must be at least 8 characters long.");
      return;
    }

    try {
      await signupMutation.mutateAsync({
        email,
        password,
        username: username.trim() || undefined,
        role,
      });

      setTimeout(() => {
        router.push("/protected");
      }, 900);
    } catch {
      // Error handled by mutation
    }
  };

  const errorMessage = clientError || signupMutation.error?.message;

  return (
    <div className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 bg-slate-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white text-center">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-mono font-semibold tracking-wide uppercase mb-2">
            Join OnlyPays
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">Create Your Account</h1>
          <p className="text-emerald-100 text-sm mt-1">
            Start earning or unlocking content with Opux (Opx)
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {isAuthenticated && user && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex flex-col gap-2">
              <span className="font-semibold text-emerald-800">
                You are currently logged in
              </span>
              <p className="text-xs text-emerald-700">
                Logged in as <strong>{user.email || user.name}</strong>.
              </p>
              <div className="flex gap-2 mt-1">
                <Link
                  href="/protected"
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold text-center flex-1"
                >
                  Go to Protected Page
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium text-center"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <span className="text-rose-500 font-bold text-sm">⚠️</span>
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {signupMutation.isSuccess && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn">
              <span className="text-emerald-600 font-bold text-sm">✓</span>
              <div className="flex-1 font-medium">
                Account created and logged in! Redirecting to protected page...
              </div>
            </div>
          )}

          {/* Account Type Selector */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("creator")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  role === "creator"
                    ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">Creator</span>
                  <span
                    className={`w-3 h-3 rounded-full border ${
                      role === "creator"
                        ? "bg-emerald-600 border-emerald-600"
                        : "border-slate-300"
                    }`}
                  />
                </div>
                <p className="text-xs text-slate-500 leading-snug">
                  Publish locked feeds & sell marketplace media in Opx
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole("subscriber")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  role === "subscriber"
                    ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">Subscriber</span>
                  <span
                    className={`w-3 h-3 rounded-full border ${
                      role === "subscriber"
                        ? "bg-emerald-600 border-emerald-600"
                        : "border-slate-300"
                    }`}
                  />
                </div>
                <p className="text-xs text-slate-500 leading-snug">
                  Subscribe to channels & unlock digital collections
                </p>
              </button>
            </div>
          </div>

          {/* Custom In-App Sign Up Form (TanStack Query + Axios) */}
          <form onSubmit={handleCustomSignUp} className="space-y-3.5">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1"
              >
                Username (Optional)
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="creator_handle"
                disabled={signupMutation.isPending}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm text-slate-800 placeholder-slate-400 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                required
                disabled={signupMutation.isPending}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm text-slate-800 placeholder-slate-400 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  disabled={signupMutation.isPending}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm text-slate-800 placeholder-slate-400 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Must include 8+ characters, numbers, and special characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {signupMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering with TanStack Query...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-mono">
                or continue with
              </span>
            </div>
          </div>

          {/* Google Quick Button */}
          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-medium shadow-sm transition-all text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Opx Benefit pill */}
          <div className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <span className="font-bold text-amber-600 font-mono">100 Opx</span>
            <span>Welcome bonus credited upon profile verification.</span>
          </div>

          {/* Log In Link */}
          <p className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
            >
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
