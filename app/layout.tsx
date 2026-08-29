import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HostingWeb - Jasa Web Murah",
  description:
    "Hosting, domain dan kebutuhan website dengan harga terjangkau.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}