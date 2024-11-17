import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Liveheats coding challenge",
  description: "Coding challenge for role at liveheats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="bg-white shadow-sm border-b py-4 px-6 fixed top-0 z-10 inset-x-0">
          <Link
            href="/"
            className="text-3xl font-bold tracking-tight text-red-500"
          >
            Live Heats
            <span className="text-red-500">🏆</span>
          </Link>
        </header>
        <main className="mt-36 pb-12">{children}</main>
      </body>
    </html>
  );
}
