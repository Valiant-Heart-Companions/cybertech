import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import StoryblokInitializer from "~/components/StoryblokInitializer";

export const metadata: Metadata = {
  title: "Cecomsa - Technology E-commerce",
  description: "Your one-stop shop for all your technology needs",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <StoryblokInitializer>
            {children}
          </StoryblokInitializer>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
