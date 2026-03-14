import type { Metadata } from "next";
import { Geist, Geist_Mono, Irish_Grover } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const irishGrover = Irish_Grover({
  weight: "400",
  variable: "--font-irish-grover",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "larma",
  description: "larma",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${irishGrover.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
