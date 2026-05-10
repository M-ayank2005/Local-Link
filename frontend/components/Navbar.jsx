'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const navLinks = [
  { href: '/commerce', label: 'Commerce' },
  { href: '/food', label: 'Food' },
  { href: '/resources', label: 'Resources' },
  { href: '/skills', label: 'Skills' },
  { href: '/emergency', label: 'Emergency' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 dark:border-gray-800/50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl">
        <div className="flex items-center justify-between w-full md:w-auto md:gap-8 min-w-0">
          <Link href="/" className="flex items-center gap-2 group whitespace-nowrap p-2 -ml-2" onClick={() => setIsOpen(false)}>
            <div className="bg-primary/10 p-2 rounded-xl text-primary transition-transform group-hover:scale-105 group-hover:bg-primary/20">
              <Store className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">Local Links</span>
          </Link>
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 -mr-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center min-h-[44px] min-w-[44px]"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors whitespace-nowrap flex items-center justify-center min-h-[44px] min-w-[44px]">
              {link.label}
            </Link>
          ))}
          <div className="hidden md:flex items-center gap-2 ml-4 border-l pl-6 border-gray-200 dark:border-gray-800">
            <ThemeToggle />
          </div>
        </nav>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col container mx-auto px-4 py-4 max-w-7xl">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="text-base font-semibold text-gray-800 dark:text-gray-200 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary transition-colors py-4 px-4 rounded-xl min-h-[44px] flex items-center"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
