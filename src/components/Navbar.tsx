'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'TRACKS', id: 'tracks' },
  { name: 'STRATEGY', id: 'strategy' },
  { name: 'MAP', id: 'map' },
];

export function Navbar({ className }: { className?: string }) {
  const [activeSection, setActiveSection] = useState('tracks');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    navItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { threshold: 0.3 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed top-6 left-0 right-0 z-50 flex justify-center px-6',
        className
      )}
    >
      <nav className="flex items-center gap-8 bg-transparent px-8 py-4 w-fit">
        {/* Logo Section */}
        <a
          href="#tracks"
          onClick={(e) => handleClick(e, 'tracks')}
          className="group relative flex items-center"
        >
          <span className="text-2xl font-black tracking-widest text-white transition-opacity group-hover:opacity-80 uppercase">
            OPT<span className="text-[#E8002D]">TRAX</span>
          </span>
        </a>

        {/* Divider */}
        <div className="h-6 w-px bg-white/10" />

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;

            return (
              <a
                key={item.name}
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className="relative group py-1"
              >
                <span
                  className={cn(
                    'text-sm font-bold tracking-[0.15em] transition-colors',
                    isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
                  )}
                >
                  {item.name}
                </span>

                {/* Active Indicator Line */}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#E8002D]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                
                {/* Hover Indicator Line (Only visible on inactive items) */}
                {!isActive && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 scale-x-0 bg-white/30 transition-transform duration-300 origin-left group-hover:scale-x-100" />
                )}
              </a>
            );
          })}
        </div>
      </nav>
    </motion.div>
  );
}
