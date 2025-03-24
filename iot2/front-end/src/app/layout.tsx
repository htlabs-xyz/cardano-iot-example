import Header from "@/components/layout/_header";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { WalletProvider } from "../contexts/wallet-context";
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
  title: "IOT 02 - The locker",
  description: "Open electric lock with blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased `}>
        <WalletProvider>
          <Header />
          <main className=" max-w-6xl mx-auto">
            {children}
          </main>
        </WalletProvider>
        {/* <Footer /> */}
      </body >
    </html >
  );
}
