import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Inter, Montserrat, Noto_Sans, Oxygen, Poppins, Roboto, Roboto_Mono, Dancing_Script, Exo_2, Lobster_Two, Caveat, Shadows_Into_Light } from "next/font/google";
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

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dancing-script",
});

const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-exo-2",
});

const lobsterTwo = Lobster_Two({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lobster-two",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-caveat",
});

const shadowsIntoLight = Shadows_Into_Light({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-shadows-into-light",
});

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
        ${dancingScript.variable} 
        ${exo2.variable} 
        ${lobsterTwo.variable} 
        ${caveat.variable} 
        ${shadowsIntoLight.variable} 
        bg-background text-navy`} suppressHydrationWarning>
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            <DisplaySettingProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
