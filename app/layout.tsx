// app/layout.tsx
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import AppProvider from "@/providers/AppProvider";
import { cookies } from "next/headers";
import Navbar from "@/components/layout/Navbar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ phải await vì cookies() trả về Promise
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme");
  const langCookie = cookieStore.get("lang");

  const cookieTheme =
    (themeCookie?.value as "white" | "dark" | "orange") ?? "dark";
  const cookieLang = (langCookie?.value as "vi" | "en") ?? "vi";

  return (
    <html
      lang={cookieLang}
      className={cookieTheme !== "white" ? `theme-${cookieTheme}` : ""}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <AppProvider initialTheme={cookieTheme} initialLang={cookieLang}>
          <Navbar />
          <main className="grow mt-16">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
