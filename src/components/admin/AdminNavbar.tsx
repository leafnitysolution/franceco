'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, LogOut, LayoutDashboard, Route as RouteIcon, CalendarCheck, Home, Star, Clock, AlertTriangle, RefreshCw, MapPin, Mail, Key } from 'lucide-react';
import { adminLogoutAction } from '@/lib/actions/auth';

const IDLE_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes (1,200,000 ms)
const WARNING_THRESHOLD_MS = 19 * 60 * 1000; // 19 minutes (shows 60s remaining modal)

export function AdminNavbar() {
  const pathname = usePathname();
  const lastActivityRef = useRef<number>(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
  }, []);

  // Listen for user activity (mouse, keyboard, click, scroll)
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    const handleUserActivity = () => {
      // If warning modal is open, user activity will reset it automatically
      resetTimer();
    };

    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Check inactivity every 1 second
    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= IDLE_TIMEOUT_MS) {
        // Auto-logout after 20 minutes of continuous inactivity
        clearInterval(checkInterval);
        adminLogoutAction();
      } else if (elapsed >= WARNING_THRESHOLD_MS) {
        setShowWarning(true);
        const remaining = Math.max(0, Math.ceil((IDLE_TIMEOUT_MS - elapsed) / 1000));
        setSecondsLeft(remaining);
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      clearInterval(checkInterval);
    };
  }, [resetTimer]);

  const navItems = [
    {
      label: 'Dashboard',
      href: '/ffs-portal-sec-99x',
      exact: true,
      icon: LayoutDashboard,
    },
    {
      label: 'Reservations',
      href: '/ffs-portal-sec-99x/bookings',
      exact: false,
      icon: CalendarCheck,
    },
    {
      label: 'Messages',
      href: '/ffs-portal-sec-99x/messages',
      exact: false,
      icon: Mail,
    },
    {
      label: 'Route Fares & SEO',
      href: '/ffs-portal-sec-99x/routes',
      exact: false,
      icon: RouteIcon,
    },
    {
      label: 'Location Hubs',
      href: '/ffs-portal-sec-99x/locations',
      exact: false,
      icon: MapPin,
    },
    {
      label: 'Reviews',
      href: '/ffs-portal-sec-99x/reviews',
      exact: false,
      icon: Star,
    },
    {
      label: 'API & Settings',
      href: '/ffs-portal-sec-99x/settings',
      exact: false,
      icon: Key,
    },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href || pathname === `${item.href}/`;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      <header className="bg-white border-b border-[#E5D7BC] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/ffs-portal-sec-99x" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gold-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
              F
            </div>
            <div>
              <span className="text-xs font-bold text-navy-900 tracking-wider block font-serif">
                FRANCEGO BACK-OFFICE
              </span>
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                SECURE ADMIN SESSION ACTIVE
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-bold">
            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#F7F2E7] text-gold-800 border-[#E5D7BC] shadow-sm font-black'
                      : 'text-slate-600 border-transparent hover:text-navy-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-gold-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1 text-xs text-slate-600 hover:text-navy-900 font-bold px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>View Site</span>
            </Link>

            <form action={adminLogoutAction}>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* 20-MINUTE INACTIVITY WARNING MODAL */}
      {showWarning && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5D7BC] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-300 shadow-md animate-bounce">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif text-xl font-bold text-navy-900">
                Session Inactivity Warning
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                You have been idle for almost 20 minutes. For security, your admin session will automatically log out in:
              </p>
              <div className="text-3xl font-black text-gold-700 tracking-wider pt-2">
                {secondsLeft}s
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={resetTimer}
                className="px-6 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Stay Logged In</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

