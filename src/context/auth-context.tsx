"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthStore, AuthUser } from "@/store/use-auth-store";
import { apiClient } from "@/lib/axios";

export type { AuthUser };

export interface SignupPayload {
  email: string;
  password: string;
  username?: string;
  role?: "creator" | "subscriber";
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  idToken: string | null;
  loginWithEmailPassword: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signupWithEmailPassword: (
    data: SignupPayload,
  ) => Promise<{ success: boolean; error?: string; autoLoggedIn?: boolean }>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  getAccessTokenSilently: () => Promise<string | null>;
  getIdTokenClaims: () => Promise<Record<string, unknown> | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function UnifiedAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth0 = useAuth0();

  // Zustand persistent store is the source of truth
  const customUser = useAuthStore((s) => s.user);
  const customAccessToken = useAuthStore((s) => s.accessToken);
  const customIdToken = useAuthStore((s) => s.idToken);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  // ── Sync Auth0 PKCE session (Google / SSO) → Zustand ─────────────────────
  // When the Auth0 SDK has an active session (e.g. after Google login) but
  // Zustand has no custom session, pull the access token silently and write
  // it to the store so every downstream consumer (protected page, Axios
  // interceptor, etc.) sees a unified session.
  useEffect(() => {
    if (auth0.isLoading) return;

    if (auth0.isAuthenticated && auth0.user && (!customAccessToken || !customIdToken)) {
      // Get both the access token and the ID token from the Auth0 SDK cache.
      // getIdTokenClaims() returns the parsed claims and `__raw` (the raw ID token JWT string).
      Promise.all([
        auth0.getAccessTokenSilently(),
        auth0.getIdTokenClaims(),
      ])
        .then(([token, claims]) => {
          if (token) {
            setSession({
              user: auth0.user as AuthUser,
              accessToken: token,
              idToken: claims?.__raw || null,
            });
          }
        })
        .catch((err) => {
          console.warn("[UnifiedAuthProvider] Could not sync PKCE tokens:", err);
        });
    }

    // If Auth0 session ended and Zustand still has a stale custom session, clear it.
    if (!auth0.isAuthenticated && !customUser && customAccessToken) {
      clearSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth0.isLoading, auth0.isAuthenticated]);

  // Compute effective user & authentication state
  // Prioritize Auth0 PKCE session if active, otherwise Zustand custom email/password session
  const isAuthenticated =
    auth0.isAuthenticated || Boolean(customUser && customAccessToken);
  const user = (auth0.user as AuthUser | undefined) || customUser || null;
  const isLoading = auth0.isLoading;
  const accessToken = customAccessToken || null;

  // In-app Email/Password Login via Axios + Zustand
  const loginWithEmailPassword = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await apiClient.post<{
          success: boolean;
          user: AuthUser;
          accessToken: string;
          idToken?: string | null;
          error?: string;
        }>("/api/auth/login", { email, password });

        const data = res.data;

        if (!data.success) {
          return {
            success: false,
            error: data.error || "Failed to log in with email and password.",
          };
        }

        setSession({
          user: data.user,
          accessToken: data.accessToken,
          idToken: data.idToken,
        });

        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Network error during login.",
        };
      }
    },
    [setSession],
  );

  // In-app Email/Password Signup via Axios + Zustand
  const signupWithEmailPassword = useCallback(
    async (payload: SignupPayload) => {
      try {
        const res = await apiClient.post<{
          success: boolean;
          error?: string;
        }>("/api/auth/signup", payload);

        const data = res.data;

        if (!data.success) {
          return {
            success: false,
            error: data.error || "Registration failed.",
          };
        }

        // Automatically log in the user upon successful signup
        const loginRes = await loginWithEmailPassword(payload.email, payload.password);
        if (loginRes.success) {
          return { success: true, autoLoggedIn: true };
        }

        return { success: true, autoLoggedIn: false };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Network error during registration.",
        };
      }
    },
    [loginWithEmailPassword],
  );

  // Google OAuth SSO
  const loginWithGoogle = useCallback(() => {
    auth0.loginWithRedirect({
      authorizationParams: { connection: "google-oauth2" },
    });
  }, [auth0]);

  // Unified Logout
  const logout = useCallback(async () => {
    clearSession();

    if (auth0.isAuthenticated) {
      auth0.logout({
        logoutParams: { returnTo: window.location.origin },
      });
    }
  }, [auth0, clearSession]);

  const getAccessTokenSilently = useCallback(async () => {
    if (customAccessToken) {
      return customAccessToken;
    }
    if (auth0.isAuthenticated) {
      try {
        const token = await auth0.getAccessTokenSilently();
        return token || null;
      } catch {
        return null;
      }
    }
    return null;
  }, [customAccessToken, auth0]);

  const getIdTokenClaims = useCallback(async () => {
    if (customUser) {
      return customUser as Record<string, unknown>;
    }
    if (auth0.isAuthenticated) {
      try {
        const claims = await auth0.getIdTokenClaims();
        return (claims as Record<string, unknown>) || null;
      } catch {
        return null;
      }
    }
    return null;
  }, [customUser, auth0]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        accessToken,
        idToken: customIdToken,
        loginWithEmailPassword,
        signupWithEmailPassword,
        loginWithGoogle,
        logout,
        getAccessTokenSilently,
        getIdTokenClaims,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  accessToken: null,
  idToken: null,
  loginWithEmailPassword: async () => ({ success: false, error: "Not initialized" }),
  signupWithEmailPassword: async () => ({ success: false, error: "Not initialized" }),
  loginWithGoogle: () => {},
  logout: async () => {},
  getAccessTokenSilently: async () => null,
  getIdTokenClaims: async () => null,
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    return defaultAuthContext;
  }
  return context;
}
