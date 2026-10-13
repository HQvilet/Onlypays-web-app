import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { HeaderNav } from "@/components/layout/header-nav";
import { ToastContainer } from "@/components/ui/toast-container";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OnlyPays | Exclusive Content & Opux Economy",
  description: "Social media platform for content creators with Opux (Opx) token subscriptions and Auth0 PKCE authentication.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <QueryProvider>
          <AuthProvider>
            <HeaderNav />
            <main className="flex-1 flex flex-col">{children}</main>
            <ToastContainer />
            <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
              <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
                OnlyPays &copy; 2026. Microservices & Opux Token Platform.
              </div>
            </footer>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
