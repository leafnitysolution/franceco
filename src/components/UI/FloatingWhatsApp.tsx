'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export function FloatingWhatsApp({
  phoneNumber = '33781118394',
  defaultMessage = 'Hello FRANCE GO! I would like to inquire about a private airport transfer.',
}: FloatingWhatsAppProps) {
  const pathname = usePathname();

  // Never render customer WhatsApp chat button inside the Admin Back-Office portal
  if (pathname?.startsWith('/ffs-portal-sec-99x') || pathname?.startsWith('/admin')) {
    return null;
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 pointer-events-none">
      {/* Floating Green WhatsApp Button (only the 56x56 icon itself captures pointer events) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp +33 7 81 11 83 94"
        className="peer pointer-events-auto relative w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-green-400 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-emerald-500/20"
      >
        {/* Animated Pulse Glow Ring */}
        <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />

        <MessageCircle className="w-7 h-7 fill-white stroke-none relative z-10" />

        {/* Online Indicator Badge */}
        <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
      </a>

      {/* Tooltip hint ONLY shown while directly hovering/focusing the WhatsApp icon */}
      <span className="hidden sm:inline-block absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold shadow-xl border border-slate-700 opacity-0 peer-hover:opacity-100 peer-focus-visible:opacity-100 transition-all duration-200 translate-x-2 peer-hover:translate-x-0 peer-focus-visible:translate-x-0 pointer-events-none">
        Chat with Dispatch (+33 7 81 11 83 94) 💬
      </span>
    </div>
  );
}
