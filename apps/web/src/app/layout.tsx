import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { getLocaleDir } from "@/lib/locale/locales";
import { LOCALE_COOKIE, resolveLocale } from "@/lib/locale/locale-cookie";
import { resolveTheme, THEME_COOKIE } from "@/lib/theme/theme-cookie";
import { ThemeProvider } from "@/lib/theme/theme-context";
import { AppTopBar } from "@/components/organisms/AppTopBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "School Dashboard",
    template: "%s | School Dashboard",
  },
  description: "School Dashboard — manage classes, students, and staff.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = resolveTheme(cookieStore.get(THEME_COOKIE)?.value);
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const dir = getLocaleDir(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme={theme}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider initialTheme={theme}>
            <AppTopBar />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
