'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FaqItem } from '@/types';

interface FaqAccordionProps {
  faqs: FaqItem[];
  title?: string;
}

export function FaqAccordion({ faqs, title = 'Frequently Asked Questions' }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#F7F2E7] border border-[#E5D7BC] flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-gold-600" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-navy-900 tracking-tight">{title}</h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl transition-all duration-200 border ${
                isOpen
                  ? 'bg-white border-gold-500/60 shadow-md ring-1 ring-gold-500/20'
                  : 'bg-white border-[#E5D7BC]/70 hover:border-gold-500'
              }`}
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-serif font-bold text-navy-900 hover:text-gold-700 transition-colors"
              >
                <span className="text-base sm:text-lg">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gold-600 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 font-medium">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
