import type { Metadata } from "next";
import "./globals.css";
import { NextAuthProvider } from "@/components/session-provider";

export const metadata: Metadata = {
  title: "TravelCRM — Travel & Tour Management",
  description: "CRM/CMS for travel and tour management companies",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
