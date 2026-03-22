'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/triage', label: 'Symptom Checker' },
  { href: '/analyze', label: 'Prescriptions' },
  { href: '/calculators', label: 'Calculators' },
  { href: '/lab-tests', label: 'Lab Hub' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header
      className={cn(
        'sticky top-0 z-50',
        'bg-gradient-to-r from-[#0ea5e9]/5 via-[#3b82f6]/5 to-[#7c3aed]/5 backdrop-blur-md',
        'shadow-[0_4px_40px_-10px_rgba(59,130,246,0.06)]'
      )}
    >
      <div className="flex justify-between items-center w-full px-6 sm:px-8 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-[#00345e] font-headline">
          PharmaAI Copilot
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm transition-colors duration-200',
                  isActive
                    ? 'text-[#3B82F6] font-bold border-b-2 border-[#3B82F6] pb-0.5'
                    : 'text-slate-500 hover:text-[#3B82F6]'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>


        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-[#EFF6FF] transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="w-5 h-5 text-[#00345e]" />
          ) : (
            <Menu className="w-5 h-5 text-[#00345e]" />
          )}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-[#EFF6FF]">
          <nav className="flex flex-col px-6 py-4 gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#EFF6FF] text-[#3B82F6] font-bold'
                      : 'text-slate-500 hover:bg-[#EFF6FF] hover:text-[#3B82F6]'
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
