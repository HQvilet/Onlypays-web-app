import { QueryClient } from "@tanstack/react-query";

/**
 * Creates a configured TanStack Query client.
 * In SSR / Next.js, each request / browser session should have its own QueryClient.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 1 minute before considering it stale
        staleTime: 60 * 1000,
        // Keep unused data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry failed queries once before showing error
        retry: 1,
        // Avoid aggressive refetching on window focus during local dev
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
