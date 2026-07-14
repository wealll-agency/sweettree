import React, { Suspense } from 'react';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import ReduxProvider from '../components/ReduxProvider';
import ConditionalHeader from '../components/ConditionalHeader';
import ConditionalFooter from '../components/ConditionalFooter';
import ScrollToTop from '../components/ScrollToTop';


const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'Sweettree',
  description: 'Premium quality dry fruits, nuts, and healthy snacks.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4f8634',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
      </head>
      <body className={`${inter.className} d-flex flex-column min-vh-100`}>
        <ReduxProvider>
          <Suspense fallback={null}>
            <ScrollToTop />
          </Suspense>
          <ConditionalHeader />
          <main className="flex-grow-1">
            {children}
          </main>
          <ConditionalFooter />
        </ReduxProvider>
        <Script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" 
          strategy="lazyOnload" 
        />
      </body>
    </html>
  );
}

