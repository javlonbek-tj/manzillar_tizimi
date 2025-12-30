// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/shared';
import { ThemeProvider } from '@/contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Uzbekistan Geographic Map',
  description: 'Interactive map of Uzbekistan with administrative boundaries',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="h-full">
      <body
        className={`${inter.className} h-full m-0 p-0 bg-gray-50 dark:bg-gray-900 overflow-hidden`}
      >
        <ThemeProvider>
          <div className="flex flex-col h-full">
            <Navigation />
            <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
