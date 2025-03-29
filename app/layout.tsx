import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from '@/lib/utils';
import type { Metadata } from "next";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "2Image",
  description: "Convert designs to images",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "antialiased"
        )}
      >
        {children}
      </body>
    </html>
  );
}
