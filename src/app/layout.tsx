import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Infinity - AI-Powered D&D Adventure",
  description: "An immersive AI-powered D&D adventure game where every choice shapes your destiny",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
