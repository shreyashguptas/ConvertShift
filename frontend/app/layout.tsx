import { Analytics } from '@/components/analytics';
import { Sidebar } from '@/components/layout/sidebar';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'File Converter',
  description: 'Convert your files between different formats easily and securely in your browser',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
