'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { useLanguage } from '@/lib/LanguageContext';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export function GoogleTranslateBridge() {
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const targetCode = currentLanguage.code;

    // Trigger select dropdown if already rendered in DOM
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (select) {
      if (select.value !== targetCode) {
        select.value = targetCode;
        select.dispatchEvent(new Event('change'));
      }
    }
  }, [currentLanguage]);

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }} aria-hidden="true" />
      <Script
        id="google-translate-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'en,fr,es,it,de,pt',
                  autoDisplay: false
                }, 'google_translate_element');
              }
            }
          `,
        }}
      />
      <Script
        id="google-translate-script"
        strategy="afterInteractive"
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      />
    </>
  );
}
