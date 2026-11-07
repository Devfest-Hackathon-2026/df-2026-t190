import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Halal Friendly App",
  description: "Find halal-friendly restaurants and check ingredients easily.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
