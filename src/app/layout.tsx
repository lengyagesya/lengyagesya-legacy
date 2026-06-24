import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "lY Docs | Smart Document Builder",
  description: "A smart document builder with editable A4 canvases.",
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
