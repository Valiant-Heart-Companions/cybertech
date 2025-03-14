import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Layout from '~/components/layout/Layout';
import { LanguageProvider } from '~/i18n/LanguageContext';
import { CartProvider } from './_components/cart/CartContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cybertech - Your Technology Partner',
  description: 'Your one-stop shop for all your technology needs',
  openGraph: {
    title: 'Cybertech - Your Technology Partner',
    description: 'Your one-stop shop for all your technology needs',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <LanguageProvider>
          <CartProvider>
            <Layout>{children}</Layout>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
