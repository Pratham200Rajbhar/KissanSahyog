import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import SessionProviderWrapper from "../components/SessionProviderWrapper";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}


export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  // Load all messages on server
  const allMessages = await getMessages();
  
  return (
    <html lang={locale} className="dark">
      <body
        className={clsx(
          inter.variable,
          manrope.variable,
          "min-h-full flex flex-col font-body selection:bg-primary/30 selection:text-primary"
        )}
      >
        <SessionProviderWrapper>
          <NextIntlClientProvider messages={allMessages} locale={locale}>
            {children}
          </NextIntlClientProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
