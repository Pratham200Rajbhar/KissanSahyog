import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import SessionProviderWrapper from "./components/SessionProviderWrapper";
import { LanguageProvider } from "./context/LanguageContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KhetSahyog | The Future of Fertile Intelligence",
  description: "Precision Farming Dashboard and Ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={clsx(
          inter.variable,
          manrope.variable,
          "min-h-full flex flex-col font-body selection:bg-primary/30 selection:text-primary"
        )}
      >
        <SessionProviderWrapper>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
