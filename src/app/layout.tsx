import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { headers } from "next/headers";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_PROJECT_NAME,
  description: process.env.NEXT_PUBLIC_PROJECT_DESCRIPTION,
  applicationName: process.env.NEXT_PUBLIC_PROJECT_NAME,
  twitter: {
    card: "summary_large_image",
    site: "0x52.buyholdearn.com",
    creator: "@laylascreations",
    images: "https://0x52.buyholdearn.com/featured_image.jpg",
  },
  openGraph: {
    type: "website",
    url: "https://0x52.buyholdearn.com",
    title: process.env.NEXT_PUBLIC_PROJECT_NAME,
    description:
      process.env.NEXT_PUBLIC_PROJECT_DESCRIPTION,
    siteName: process.env.NEXT_PUBLIC_PROJECT_NAME,
    images: [
      {
        url: "https://0x52.buyholdearn.com/featured_image.jpg",
      },
    ],
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookie = headers().get("cookie");
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers cookie={cookie}>{children}</Providers>
      </body>
    </html>
  );
}