"use client";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Callback() {
  const { isLoading, isAuthenticated, error } = useAuth0();
  const router = useRouter();

  

  useEffect(() => {
    // The SDK processes ?code&state automatically when the provider mounts.
    if (!isLoading && isAuthenticated) router.replace("/");
  }, [isLoading, isAuthenticated, router]);

  if (error) return <p>Login failed: {error.message}</p>;
  return <p>Signing you in…</p>;
}