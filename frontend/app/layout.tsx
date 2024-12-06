import { Analytics } from '@/components/analytics';
import { Sidebar } from '@/components/layout/sidebar';
import { Footer } from '@/components/layout/footer';
import { FeedbackButton } from '@/components/feedback-button';
import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ConvertShift',
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
      </body>
    </html>
  );
}
