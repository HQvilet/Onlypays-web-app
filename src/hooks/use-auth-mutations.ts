"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { useAuthStore, AuthUser } from "@/store/use-auth-store";
import { useUIStore } from "@/store/use-ui-store";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: AuthUser;
  accessToken: string;
  idToken?: string | null;
  expiresIn?: number;
}

export interface SignupCredentials {
  email: string;
  password: string;
  username?: string;
  role?: "creator" | "subscriber";
}

export interface SignupResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    username: string;
    emailVerified: boolean;
    role: string;
  };
}

/**
 * TanStack Query mutation for in-app Email/Password login via Axios.
 * Automatically persists session to Zustand store upon success.
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>(
        "/api/auth/login",
        credentials,
      );
      return response.data;
    },
    onSuccess: (data) => {
      setSession({
        user: data.user,
        accessToken: data.accessToken,
        idToken: data.idToken,
      });

      // Invalidate any user queries to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ["user"] });

      addToast({
        type: "success",
        message: `Welcome back, ${data.user.name || data.user.email}!`,
      });
    },
    onError: (error: Error) => {
      addToast({
        type: "error",
        message: error.message || "Failed to sign in.",
      });
    },
  });
}

/**
 * TanStack Query mutation for in-app registration via Axios.
 * Upon successful account creation, automatically signs in.
 */
export function useSignupMutation() {
  const loginMutation = useLoginMutation();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (payload: SignupCredentials): Promise<SignupResponse> => {
      const response = await apiClient.post<SignupResponse>(
        "/api/auth/signup",
        payload,
      );
      return response.data;
    },
    onSuccess: async (_data, variables) => {
      addToast({
        type: "success",
        message: "Account created successfully! Signing you in...",
      });

      // Automatically sign in with the new credentials
      try {
        await loginMutation.mutateAsync({
          email: variables.email,
          password: variables.password,
        });
      } catch (err) {
        console.warn("Auto-login after signup failed:", err);
      }
    },
    onError: (error: Error) => {
      addToast({
        type: "error",
        message: error.message || "Failed to create account.",
      });
    },
  });
}

/**
 * Hook to perform clean client-side logout.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);
  const addToast = useUIStore((state) => state.addToast);

  return () => {
    clearSession();
    queryClient.clear();
    addToast({
      type: "info",
      message: "You have been logged out.",
    });
  };
}
