import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cyber Club",
  description:
    "Cyber Club — a student-run community for security, code, and curiosity. Join the launch.",
  keywords: [
    "cybersecurity",
    "cyber club",
    "student club",
    "security",
    "technology",
    "CTF",
  ],
  authors: [{ name: "Cyber Club" }],
  robots: { index: false, follow: false },
  icons: {
    icon: "/cyberclub-optimized.png",
    apple: "/cyberclub-optimized.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground cyber-ops min-h-screen flex flex-col`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
