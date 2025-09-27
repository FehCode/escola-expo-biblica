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
  title: "Escola de Exposição Bíblica",
  description: "Aprenda os princípios fundamentais da interpretação bíblica e pregação expositiva através de cursos online.",
  keywords: ["Bíblia", "Hermenêutica", "Pregação Expositiva", "Teologia", "Escola Bíblica"],
  authors: [{ name: "Escola de Exposição Bíblica" }],
  openGraph: {
    title: "Escola de Exposição Bíblica",
    description: "Aprenda os princípios fundamentais da interpretação bíblica e pregação expositiva através de cursos online.",
    url: "https://escolabiblica.com",
    siteName: "Escola de Exposição Bíblica",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Escola de Exposição Bíblica",
    description: "Aprenda os princípios fundamentais da interpretação bíblica e pregação expositiva através de cursos online.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
