import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { TranslationsProvider } from "@/components/translations-context";

const inter = Inter({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "YAPPA'",
  description: "Learn anything. Anywhere.",
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
        <TranslationsProvider>{children}</TranslationsProvider>
      </body>
    </html>
  );
}
