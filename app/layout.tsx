import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SWRegister } from '@/components/SWRegister';

export const metadata: Metadata = {
  title: 'MealScan Pro',
  description: 'AI-powered calorie tracking and meal scanner',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'MealScan Pro' },
  formatDetection: { telephone: false },
};
export const viewport: Viewport = { themeColor: '#2DB8A4', width: 'device-width', initialScale: 1, maximumScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
      </head>
      <body>
        <SWRegister/>
        <div className="max-w-md mx-auto min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  );
}
