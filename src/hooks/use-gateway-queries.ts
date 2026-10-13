"use client";

import { useQuery } from "@tanstack/react-query";
import { gatewayClient } from "@/lib/axios";
import { useAuthStore } from "@/store/use-auth-store";

export interface GatewayHealthResponse {
  status: string;
  service?: string;
  timestamp?: string;
}

export interface UserProfileResponse {
  status: string;
  data: {
    id: string;
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    role: string;
    isVerified: boolean;
    createdAt: string;
  };
}

/**
 * TanStack Query hook probing the Envoy Gateway health route via Axios.
 */
export function useGatewayHealthQuery(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ["gateway", "health", accessToken],
    queryFn: async (): Promise<GatewayHealthResponse> => {
      const response = await gatewayClient.get<GatewayHealthResponse>(
        "/user-social/health",
      );
      return response.data;
    },
    enabled: enabled && Boolean(accessToken),
    retry: 1,
    staleTime: 30 * 1000,
  });
}

/**
 * TanStack Query hook fetching the authenticated user's profile from the microservice.
 */
export function useCurrentProfileQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ["user", "me", accessToken],
    queryFn: async (): Promise<UserProfileResponse> => {
      const response = await gatewayClient.get<UserProfileResponse>(
        "/api/user-social/api/users/me",
      );
      return response.data;
    },
    enabled: isAuthenticated && Boolean(accessToken),
    staleTime: 60 * 1000,
  });
}

/**
 * TanStack Query hook fetching a public user profile by userId.
 */
export function useUserProfileQuery(userId: string) {
  return useQuery({
    queryKey: ["user", "profile", userId],
    queryFn: async (): Promise<UserProfileResponse> => {
      const response = await gatewayClient.get<UserProfileResponse>(
        `/api/user-social/api/users/${userId}`,
      );
      return response.data;
    },
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
  });
}
