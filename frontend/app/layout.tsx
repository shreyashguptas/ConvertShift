import { Analytics } from '@/components/analytics';
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
