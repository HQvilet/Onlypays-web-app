"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useLogout } from "@/hooks/use-auth-mutations";
import { useGatewayHealthQuery } from "@/hooks/use-gateway-queries";
import { useOpxStore } from "@/store/use-opx-store";

export default function ProtectedPage() {
  // useAuth() merges Auth0 PKCE (Google/SSO) + Zustand (email/password) sessions
  const { user, isAuthenticated, accessToken, idToken, logout: authLogout } = useAuth();
  // Still read opxBalance from its own store
  const opxBalance = useOpxStore((s) => s.balance);
  // Zustand logout clears query cache too; fall back to context logout for SSO
  const zustandLogout = useLogout();
  const logout = () => { zustandLogout(); authLogout(); };

  // TanStack Query hook powered by Axios gatewayClient
  const {
    data: gatewayHealth,
    isLoading: isProbeLoading,
    isError: isProbeError,
    error: probeError,
    refetch: refetchHealth,
    isFetching: isProbeFetching,
  } = useGatewayHealthQuery(Boolean(accessToken));

  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;

  // ── Decode ID-token JWT payload (client-side, no library) ──────────────────
  const idTokenClaims = React.useMemo<Record<string, unknown> | null>(() => {
    if (!idToken) return null;
    try {
      const payloadB64 = idToken.split(".")[1];
      if (!payloadB64) return null;
      // atob requires standard base64; JWT uses base64url — replace chars
      const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(json) as Record<string, unknown>;
    } catch {
      return null;
    }
  }, [idToken]);

  // app_metadata & user_metadata can appear under a namespace or at root
  const appMetadata = React.useMemo<Record<string, unknown> | null>(() => {
    if (!idTokenClaims) return null;
    // Auth0 standard key
    if (idTokenClaims["user_id"]) return idTokenClaims["user_id"] as Record<string, unknown>;
    // Namespaced key pattern: https://<anything>/app_metadata
    const nsKey = Object.keys(idTokenClaims).find((k) => k.endsWith("internal_user_id"));
    return nsKey ? (idTokenClaims[nsKey] as Record<string, unknown>) : null;
  }, [idTokenClaims]);

  const userMetadata = React.useMemo<Record<string, unknown> | null>(() => {
    if (!idTokenClaims) return null;
    if (idTokenClaims["user_metadata"]) return idTokenClaims["user_metadata"] as Record<string, unknown>;
    const nsKey = Object.keys(idTokenClaims).find((k) => k.endsWith("/user_metadata"));
    return nsKey ? (idTokenClaims[nsKey] as Record<string, unknown>) : null;
  }, [idTokenClaims]);

  // ── Decode Access-token JWT payload ───────────────────────────────────────
  const accessTokenClaims = React.useMemo<Record<string, unknown> | null>(() => {
    if (!accessToken) return null;
    try {
      const payloadB64 = accessToken.split(".")[1];
      if (!payloadB64) return null;
      const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(json) as Record<string, unknown>;
    } catch {
      return null;
    }
  }, [accessToken]);

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Title & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-semibold">
                Protected Route
              </span>
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-mono text-xs font-semibold">
                Zustand + TanStack Query + Axios
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Authentication Test Page
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Testing Client-Side React Query, Zustand Store, JWT Tokens &amp; Envoy Gateway
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
              >
                Log Out
              </button>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
              >
                Log In
              </Link>
            )}
          </div>
        </div>

        {/* Authenticated State */}
        {isAuthenticated && user ? (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {user.picture ? (
                    <img
                      src={user.picture as string}
                      alt={user.name || "User Avatar"}
                      className="w-16 h-16 rounded-2xl border-2 border-white/30 shadow-md object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center font-bold text-2xl text-white">
                      {(user.name || user.email || "U").slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold">
                        {user.name || "Authenticated User"}
                      </h2>
                      {user.email_verified && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 border border-emerald-300/30 text-[10px] font-mono">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-emerald-100 text-xs font-mono mt-0.5">
                      {user.email}
                    </p>
                    <p className="text-[11px] text-emerald-200/80 font-mono mt-1">
                      Sub: {user.sub}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-mono font-semibold backdrop-blur-md">
                    Zustand Session Active
                  </span>
                  <span className="text-amber-300 font-mono text-xs mt-2 font-bold">
                    {opxBalance} Opx Available
                  </span>
                </div>
              </div>
            </div>

            {/* Microservice Health Query Section (TanStack Query + Axios) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  Envoy Gateway Health Probe (TanStack Query + Axios)
                </h3>
                <button
                  onClick={() => refetchHealth()}
                  disabled={isProbeFetching}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isProbeFetching && (
                    <span className="w-3 h-3 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Refetch Probe</span>
                </button>
              </div>

              {isProbeLoading ? (
                <div className="p-4 bg-slate-50 rounded-xl font-mono text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span>Fetching health probe via Axios gateway client...</span>
                </div>
              ) : isProbeError ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl font-mono text-xs text-amber-800">
                  <span className="font-bold">Gateway Probe:</span> {probeError?.message || "Service unavailable"}. (Ensure port 30800 port-forward is active).
                </div>
              ) : (
                <div className="p-4 bg-slate-900 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto">
                  <pre>{JSON.stringify(gatewayHealth, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* ── Auth0 app_metadata & user_metadata ──────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* app_metadata */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  Auth0{" "}
                  <code className="font-mono text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">
                    app_metadata
                  </code>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mb-3">
                  Server-managed, user cannot modify. Decoded from ID token.
                </p>
                {idToken ? (
                  appMetadata ? (
                    <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-violet-300 overflow-x-auto max-h-64 overflow-y-auto">
                      <pre>{JSON.stringify(appMetadata, null, 2)}</pre>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl font-mono text-xs text-amber-700">
                      No <code>app_metadata</code> claim found in ID token.
                      <br />
                      <span className="text-amber-500">Add an Auth0 Action to inject it.</span>
                    </div>
                  )
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-500">
                    No ID token in session. Log in via email/password to decode JWT claims.
                  </div>
                )}
              </div>

              {/* user_metadata */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  Auth0{" "}
                  <code className="font-mono text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                    user_metadata
                  </code>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mb-3">
                  User-editable preferences &amp; profile extras. Decoded from ID token.
                </p>
                {idToken ? (
                  userMetadata ? (
                    <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-sky-300 overflow-x-auto max-h-64 overflow-y-auto">
                      <pre>{JSON.stringify(userMetadata, null, 2)}</pre>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl font-mono text-xs text-amber-700">
                      No <code>user_metadata</code> claim found in ID token.
                    </div>
                  )
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-500">
                    No ID token in session.
                  </div>
                )}
              </div>
            </div>

            {/* Full ID Token Claims */}
            {idTokenClaims && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Full ID Token Claims
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mb-3">
                  All claims decoded from the stored{" "}
                  <code className="text-indigo-600">idToken</code> JWT payload
                  (base64url-decoded, not verified client-side).
                </p>
                <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-indigo-300 overflow-x-auto max-h-72 overflow-y-auto">
                  <pre>{JSON.stringify(idTokenClaims, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* Grid details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Session Claims Inspector (Zustand Store) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Zustand Auth Store State
                </h3>
                <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-64 overflow-y-auto">
                  <pre>{JSON.stringify({ user, idToken: idToken ? "present (JWT)" : null }, null, 2)}</pre>
                </div>
              </div>

              {/* Token & Envoy Integration info */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Stack Architecture
                  </h3>
                  <div className="space-y-3 text-xs text-slate-600">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="font-semibold text-slate-800">Client State:</span>{" "}
                      <span className="font-mono text-emerald-700 font-bold">
                        Zustand with LocalStorage Persistence
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="font-semibold text-slate-800">Data Fetching:</span>{" "}
                      <span className="font-mono text-slate-700 font-bold">
                        TanStack Query v5 + Axios Client
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="font-semibold text-slate-800">Server Fetching:</span>{" "}
                      <span className="font-mono text-slate-700 font-bold">
                        Disabled (100% Client-Side Rendered)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="font-semibold text-slate-800">Auth0 Domain:</span>{" "}
                      <code className="bg-slate-200 text-slate-900 px-1.5 py-0.5 rounded font-mono">
                        {domain}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Status: Authenticated (Zustand)</span>
                  <Link
                    href="/"
                    className="font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    Back to Home &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Access Token Viewer */}
            {accessToken && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  Access Token (Attached via Axios Interceptor)
                </h3>
                <p className="text-xs text-slate-500 -mt-2">
                  JWT automatically attached to all outgoing Axios requests by the interceptor in{" "}
                  <code className="text-emerald-700 font-mono">src/lib/axios.ts</code>.
                </p>

                {/* Raw token string */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Raw JWT</p>
                  <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-300 break-all max-h-28 overflow-y-auto">
                    {accessToken}
                  </div>
                </div>

                {/* Decoded claims */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Decoded Claims</p>
                  {accessTokenClaims ? (
                    <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-teal-300 overflow-x-auto max-h-72 overflow-y-auto">
                      <pre>{JSON.stringify(accessTokenClaims, null, 2)}</pre>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-400">
                      Could not decode JWT payload.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Unauthenticated State */
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              🔒
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Authentication Required
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              You need to sign in to view token claims and inspect microservice health queries.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md"
              >
                Go to Log In Page
              </Link>
              <Link
                href="/signup"
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-colors"
              >
                Create an Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
