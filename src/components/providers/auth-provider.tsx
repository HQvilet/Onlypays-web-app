"use client";

import React, { useState } from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import { UnifiedAuthProvider } from "@/context/auth-context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [redirectUri] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";
  });

  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;

  // UnifiedAuthProvider is ALWAYS rendered so useAuth() is available during SSR & CSR
  if (!domain || !clientId) {
    return <UnifiedAuthProvider>{children}</UnifiedAuthProvider>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        ...(audience ? { audience } : {}),
        scope: "openid profile email",
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <UnifiedAuthProvider>{children}</UnifiedAuthProvider>
    </Auth0Provider>
  );
}
