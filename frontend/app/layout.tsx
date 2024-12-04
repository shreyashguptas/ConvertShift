import { Analytics } from '@/components/analytics';
import { Sidebar } from '@/components/layout/sidebar';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'File Converter',
  description: 'Convert your files between different formats easily and securely in your browser',
  icons: {
    icon: [
      {
        url: '/images/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        url: '/images/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/images/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      }
    ],
    apple: [
      {
        url: '/images/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/images/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/images/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="font-sans antialiased">
        <div className="relative h-screen">
          <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
            <Sidebar />
          </div>
          <main className="md:pl-72">
            {children}
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
