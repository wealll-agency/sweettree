import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import ReduxProvider from '../components/ReduxProvider';
import ConditionalHeader from '../components/ConditionalHeader';
import ConditionalFooter from '../components/ConditionalFooter';


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sweettree - Home',
  description: 'Sweettree ecommerce website migrated to Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
      </head>
      <body className={inter.className}>
        <ReduxProvider>
          <ConditionalHeader />
          {children}
          <ConditionalFooter />
        </ReduxProvider>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" async></script>
      </body>
    </html>
  );
}
