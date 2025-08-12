import { Analytics } from '@/components/analytics';
import { Sidebar } from '@/components/layout/sidebar';
import { Footer } from '@/components/layout/footer';
import { FeedbackButton } from '@/components/feedback-button';
import { Toaster } from '@/components/ui/toaster';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ServiceWorkerRegistration } from './components/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: 'ConvertShift',
  description: 'Convert your files between different formats easily and securely in your browser',
  manifest: '/manifest.json',
  metadataBase: new URL('https://convertshift.com'),
  
  // Basic favicon
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    // Apple-specific icons
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    // Safari pinned tab icon
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#000000' },
    ],
  },
  
  // Apple-specific metadata
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ConvertShift',
    startupImage: [
      {
        url: '/icons/apple-splash-2048-2732.png',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/apple-splash-1668-2388.png',
        media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/apple-splash-1536-2048.png',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/apple-splash-1125-2436.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/icons/apple-splash-1242-2688.png',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  
  // Microsoft-specific metadata
  other: {
    'msapplication-TileColor': '#000000',
    'msapplication-TileImage': '/icons/mstile-144x144.png',
  },
  
  // Open Graph metadata
  openGraph: {
    type: 'website',
    title: 'ConvertShift',
    description: 'Convert your files between different formats easily and securely in your browser',
    images: [{ url: '/icons/og-image.png', width: 1200, height: 630 }],
  },
  
  // Twitter metadata
  twitter: {
    card: 'summary_large_image',
    title: 'ConvertShift',
    description: 'Convert your files between different formats easily and securely in your browser',
    images: ['/icons/twitter-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="font-sans antialiased h-full">
        <div className="h-full flex">
          <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
            <Sidebar />
          </div>
          <div className="flex-1 flex flex-col md:pl-72">
            <main className="flex-1 flex flex-col h-full">
              <div className="flex-1 overflow-auto">
                {children}
              </div>
              <Footer />
            </main>
          </div>
        </div>
        <FeedbackButton />
        <Toaster />
        <Analytics />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
