import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import "@/components/Header";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Your 2 fonts, same weights as the Figma text styles
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-bricolage",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Quality Hunt",
  description: "Fashion finds and home fixes, checked before we recommend them.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Header/>
        <main className="flex-1">{children}</main>
        <Footer/>
      </body>
    </html>
  );
}