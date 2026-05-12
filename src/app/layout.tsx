import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "lengYagesya Legacy",
  description: "Build the Future with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
