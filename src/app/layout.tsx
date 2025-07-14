import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from '~/components/ui/sonner';

export const metadata: Metadata = {
  title: {
    default: "HMM LMS",
    template: "%s | HMM LMS",
  },
  description: "LMS for Himpunan Mahasiswa Mesin ITB",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} bg-background text-navy`}>
      <body>
        <SessionProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
