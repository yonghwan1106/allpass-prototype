import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "All-Pass | AI 기반 민원 처리 플랫폼",
  description:
    "멀티 에이전트 AI가 복합 민원을 자동으로 분석하고, 원스톱으로 처리하는 차세대 민원 서비스 플랫폼",
  keywords: ["AI", "민원", "멀티에이전트", "All-Pass", "행정안전부"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} ${notoSansKR.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
