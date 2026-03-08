import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CartProvider } from '@/context/CartContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { Store, User } from 'lucide-react';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Local Links',
  description: 'Connect with sellers and services in your neighborhood.',
};

const navLinks = [
  { href: '/commerce', label: 'Commerce' },
  { href: '/food', label: 'Food' },
  { href: '/resources', label: 'Resources' },
  { href: '/skills', label: 'Skills' },
  { href: '/emergency', label: 'Emergency' },
];

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
              <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 dark:border-gray-800/50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm transition-all duration-300">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl">
                  <div className="flex items-center gap-8 min-w-0">
                    <Link href="/" className="flex items-center gap-2 group whitespace-nowrap">
                      <div className="bg-primary/10 p-2 rounded-xl text-primary transition-transform group-hover:scale-105 group-hover:bg-primary/20">
                        <Store className="h-5 w-5" />
                      </div>
                      <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">Local Links</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                      {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="text-sm font-semibold text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors whitespace-nowrap">
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                  </div>
                </div>
              </header>
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
