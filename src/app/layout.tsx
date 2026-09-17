import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

// Primary Enterprise Typography: Satoshi Font Family across the entire platform
const satoshi = localFont({
  src: [
    {
      path: "../../public/fonts/satoshi/Satoshi-Light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/satoshi/Satoshi-LightItalic.woff",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/satoshi/Satoshi-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/satoshi/Satoshi-Italic.woff",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/satoshi/Satoshi-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/satoshi/Satoshi-MediumItalic.woff",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/satoshi/Satoshi-Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/satoshi/Satoshi-BoldItalic.woff",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/satoshi/Satoshi-Black.woff",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

// Figures & Tabular Mono Font for exact numerical displays
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#065F46",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "DelaHR — Unified Global Workforce, Payroll & People Operating System",
    template: "%s | DelaHR Enterprise",
  },
  description:
    "DelaHR is the unified global workforce and payroll operating system designed for modern enterprises. Manage cross-border payroll, 24/7 continuous operations, employee leave & claims, corporate shutdowns, and digital onboarding in one elegant platform across 150+ currencies.",
  keywords: [
    "DelaHR",
    "global workforce operating system",
    "enterprise payroll platform",
    "cross-border human resources",
    "employee leave management",
    "expense claims and travel per diem",
    "24/7 workforce scheduling",
    "digital employee onboarding",
    "corporate shutdown planning",
    "automated statutory returns",
    "people management software",
  ],
  authors: [{ name: "DelaHR Global Team", url: "https://delahr.com" }],
  creator: "DelaHR Inc.",
  publisher: "DelaHR Holdings",
  applicationName: "DelaHR",
  metadataBase: new URL("https://delahr.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://delahr.com",
    title: "DelaHR — Unified Global Workforce, Payroll & People Operating System",
    description:
      "The complete people operating system for modern global businesses. Automate cross-border payroll, 24/7 shift scheduling, employee expenses, and compliance seamlessly across any jurisdiction.",
    siteName: "DelaHR",
    images: [
      {
        url: "/og-delahr.png",
        width: 1200,
        height: 630,
        alt: "DelaHR Unified Workforce Operating System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DelaHR — Unified Global Workforce, Payroll & People Operating System",
    description:
      "Modern enterprise people and payroll operating system. Empowering teams across borders with automated payroll, continuous shifts, and seamless compliance.",
    creator: "@DelaHR_global",
    images: ["/og-delahr.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg?v=2", type: "image/svg+xml" },
      { url: "/favicon.ico?v=2", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/icon.svg?v=2",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${satoshi.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <link rel="icon" href="/icon.svg?v=2" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--emerald-light)] selection:text-[var(--emerald-deep)]"
      >
        {children}
      </body>
    </html>
  );
}
