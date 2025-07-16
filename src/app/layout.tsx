import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Inter, Montserrat, Noto_Sans, Oxygen, Poppins, Roboto, Roboto_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from '~/components/ui/sonner';
import { ThemeProvider } from '~/components/providers/theme-provider';
import { DisplaySettingProvider } from '~/components/providers/display-provider';

export const metadata: Metadata = {
  title: {
    default: "HMM LMS",
    template: "%s | HMM LMS",
  },
  description: "LMS for Himpunan Mahasiswa Mesin ITB",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

const oxygen = Oxygen({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-oxygen",
})

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
})

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`
        ${geist.variable} 
        ${inter.variable} 
        ${montserrat.variable} 
        ${roboto.variable} 
        ${poppins.variable} 
        ${oxygen.variable} 
        ${notoSans.variable} 
        ${robotoMono.variable} 
        bg-background text-navy`} suppressHydrationWarning>
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            <DisplaySettingProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                {children}
              </ThemeProvider>
            </DisplaySettingProvider>
          </TRPCReactProvider>
          <Toaster richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
