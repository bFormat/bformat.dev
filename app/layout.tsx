import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://bformat.dev"),
  title: "bformat.dev — 전승민",
  description:
    "AI 업무역량 평가·훈련 플랫폼을 만들고, 학생들에게 알고리즘과 AI를 가르치는 전승민의 개인 페이지.",
  applicationName: "bformat.dev",
  authors: [{ name: "전승민", url: "https://bformat.dev" }],
  creator: "전승민",
  publisher: "bformat.dev",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "bformat.dev — 전승민",
    description:
      "AI 업무역량 평가·훈련 플랫폼을 만들고, 알고리즘과 AI를 가르칩니다.",
    url: "/",
    siteName: "bformat.dev",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-bformat-20260716.png",
        type: "image/png",
        width: 1200,
        height: 630,
        alt: "bformat.dev — 전승민 소개",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "bformat.dev — 전승민",
    description:
      "AI 업무역량 평가·훈련 플랫폼을 만들고, 알고리즘과 AI를 가르칩니다.",
    images: ["/og-bformat-20260716.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#073d2a",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
