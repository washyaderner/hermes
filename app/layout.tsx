import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hermes - Prompt Engineering Optimization",
  description: "Transform basic prompts into platform-specific, optimized versions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
