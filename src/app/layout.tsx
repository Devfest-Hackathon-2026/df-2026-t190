import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Halal Check",
  description: "Your personalized Halal food scanner and assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full">
      <head>
        {/* Tailwind CDNを念のため注入し、ビルドやキャッシュの不具合時でも100%確実に美しいスタイルが適用されるようにする */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      brand: {
                        50: '#F0FDF4',
                        100: '#DCFCE7',
                        400: '#4ADE80',
                        500: '#22C55E',
                        600: '#16A34A',
                        DEFAULT: '#27C27B',
                        dark: '#1EA866',
                        light: '#E8F8F0',
                      }
                    }
                  }
                }
              }
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-[#E5F5ED] text-slate-800 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
