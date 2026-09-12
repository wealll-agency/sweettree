import React, { Suspense } from 'react';
import { Inter, Outfit } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import ReduxProvider from '../components/ReduxProvider';
import ConditionalHeader from '../components/ConditionalHeader';
import ConditionalFooter from '../components/ConditionalFooter';
import ScrollToTop from '../components/ScrollToTop';
import ChunkErrorHandler from '../components/ChunkErrorHandler';
import ConditionalMobileUI from '../components/ConditionalMobileUI';


import { NotificationProvider } from '../context/NotificationContext';
import CookieConsent from '../components/CookieConsent';
import PromotionalPopup from '../components/PromotionalPopup';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], display: 'swap', variable: '--font-outfit' });

export const metadata = {
  metadataBase: new URL('https://www.sweettreeon.com'),
  title: 'Sweettree',
  description: 'Premium quality dry fruits, nuts, and healthy snacks.',
  alternates: {
    canonical: '/',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4f8634',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Sweettree",
              "url": "https://www.sweettreeon.com",
              "logo": "https://www.sweettreeon.com/logo.png"
            })
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${inter.className} d-flex flex-column min-vh-100`}>
        <ChunkErrorHandler />
        <ReduxProvider>
          <NotificationProvider>
            <Suspense fallback={null}>
              <ScrollToTop />
            </Suspense>
            <ConditionalHeader />
            <ConditionalMobileUI />
            <main className="flex-grow-1 d-flex flex-column">
              {children}
            </main>
            <ConditionalFooter />
            <Suspense fallback={null}>
              <PromotionalPopup />
            </Suspense>
          </NotificationProvider>
        </ReduxProvider>
        <CookieConsent />
        <Script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" 
          strategy="lazyOnload" 
        />

        {/* Google Analytics (GA4) */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}

        {/* Meta Pixel Code */}
        {process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
          <>
            <Script id="facebook-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img 
                height="1" 
                width="1" 
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID}&ev=PageView&noscript=1`}
                alt="facebook pixel"
              />
            </noscript>
          </>
        )}
      </body>
    </html>
  );
}

