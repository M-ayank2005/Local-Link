import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CartProvider } from '@/context/CartContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { Store } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Local Links',
  description: 'Connect with sellers and services in your neighborhood.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-14 items-center justify-between p-4 md:p-8">
                  <div className="flex items-center space-x-2">
                    <Link href="/" className="flex items-center space-x-2 font-bold text-lg text-primary">
                      <Store className="h-5 w-5" />
                      <span>Local Links</span>
                    </Link>
                  </div>
                  <ThemeToggle />
                </div>
              </header>
              <main className="flex-1">
                {children}
              </main>
            </div>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
