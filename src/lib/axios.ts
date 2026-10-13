import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/use-auth-store";

/**
 * Standard correlation ID generator for end-to-end tracing across microservices.
 */
function generateCorrelationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Common request interceptor:
 * - Attaches Authorization Bearer token from Zustand auth store.
 * - Attaches X-Correlation-ID for tracing.
 */
// function attachAuthAndCorrelation(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
//   // Attach correlation ID
//   if (!config.headers["X-Correlation-ID"]) {
//     config.headers["X-Correlation-ID"] = generateCorrelationId();
//   }

//   // Attach token from Zustand store if not already provided
//   if (!config.headers.Authorization && typeof window !== "undefined") {
//     const token = useAuthStore.getState().accessToken;
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//   }

//   return config;
// }

/**
 * Common response error interceptor:
 * Normalizes error messages from various backend error shapes into Error.message.
 */
function handleAxiosError(error: AxiosError<{ message?: string; error?: string }>): Promise<never> {
  let message = "An unexpected error occurred.";

  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === "string") {
      message = data;
    } else if (data.message) {
      message = data.message;
    } else if (data.error) {
      message = data.error;
    }
  } else if (error.message) {
    message = error.message;
  }

  const enhancedError = new Error(message);
  // Preserve original status and details
  (enhancedError as unknown as { status?: number; code?: string }).status = error.response?.status;
  (enhancedError as unknown as { status?: number; code?: string }).code = error.code;

  return Promise.reject(enhancedError);
}

/**
 * Client for same-origin Next.js BFF API endpoints (e.g. /api/auth/login, /api/auth/signup).
 */
export const apiClient = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// apiClient.interceptors.request.use(attachAuthAndCorrelation);
apiClient.interceptors.response.use((response) => response, handleAxiosError);

/**
 * Client for direct microservice calls routed through Envoy Gateway.
 * Base URL defaults to Envoy Gateway port (30800 in Kubernetes or NEXT_PUBLIC_GATEWAY_URL).
 */
export const gatewayClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:30800",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// gatewayClient.interceptors.request.use(attachAuthAndCorrelation);
gatewayClient.interceptors.response.use((response) => response, handleAxiosError);
