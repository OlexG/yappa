import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { TranslationsProvider } from "@/components/translations-context";
import { NextAuthProvider } from "@/components/NextAuthProvider";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: 'Yappa',
  description: 'Learn anything, anytime',
  icons: {
    icon: '/yappa.png',
    apple: '/yappa.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${spaceGrotesk.variable} antialiased`}>
        <NextAuthProvider>
          <TranslationsProvider>
            <ClientLayout>{children}</ClientLayout>
          </TranslationsProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
