import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CricPulse - Cricket Live Score Panel",
  description: "Live Scoring and Management Console for CricPulse Cricket Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className={`${inter.className} min-h-full flex flex-col bg-zinc-50 text-zinc-900`}>
        <Providers>{children}
        </Providers>
      </body>
    </html>
  );
}
