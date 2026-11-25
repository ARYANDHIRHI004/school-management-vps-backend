import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Vikas Valley Vidyalay | Nurturing Excellence Since 2001",
  description:
    "Vikas Valley Vidyalay – A premier CBSE affiliated institution committed to academic excellence, holistic development, and future-ready education. Admissions Open 2026–27.",
  keywords: [
    "Vikas Valley Vidyalay",
    "CBSE School",
    "Admissions 2026-27",
    "Education",
  ],
  icons: {
    icon: "/images/logo.jpeg",
    shortcut: "/images/logo.jpeg",
    apple: "/images/logo.jpeg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${inter.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0F2544] selection:bg-amber-500 selection:text-white">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}