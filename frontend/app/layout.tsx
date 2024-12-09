import { Analytics } from '@/components/analytics';
import { Sidebar } from '@/components/layout/sidebar';
import { Footer } from '@/components/layout/footer';
import { FeedbackButton } from '@/components/feedback-button';
import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';
import './globals.css';
import { ServiceWorkerRegistration } from './components/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: 'ConvertShift',
  description: 'Convert your files between different formats easily and securely in your browser',
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ConvertShift',
  },
  icons: {
    icon: [
      {
        url: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
      },
      {
        url: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        url: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        url: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        url: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
      },
      {
        url: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        url: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
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
