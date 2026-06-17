import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const SITE_URL = "https://foundrybuild.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FoundryBuild — Turn ideas into buildable reality",
    template: "%s · FoundryBuild",
  },
  description:
    "FoundryBuild turns intent into execution. Describe what you want to build — software, AI systems, robotics, electronics, infrastructure, or machines — and get structured plans, architectures, and execution paths.",
  keywords: [
    "FoundryBuild",
    "build roadmap",
    "engineering intelligence",
    "AI architecture planning",
    "robotics",
    "system design",
    "execution path",
  ],
  authors: [{ name: "FoundryBuild" }],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "FoundryBuild — Turn ideas into buildable reality",
    description:
      "From software and AI systems to robotics, electronics, products, and machines. FoundryBuild generates structured plans, architectures, dependencies, and execution paths.",
    siteName: "FoundryBuild",
  },
  twitter: {
    card: "summary_large_image",
    title: "FoundryBuild — Turn ideas into buildable reality",
    description:
      "Describe what you want to create. FoundryBuild generates structured build plans from intent to execution.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "FoundryBuild",
              url: SITE_URL,
              slogan: "Turn ideas into buildable reality.",
              description:
                "FoundryBuild generates structured roadmaps that explain how to build complex systems step-by-step.",
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
