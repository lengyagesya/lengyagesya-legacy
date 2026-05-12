import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "lY Docs",
  description: "Jana dokumen profesional dalam beberapa minit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
