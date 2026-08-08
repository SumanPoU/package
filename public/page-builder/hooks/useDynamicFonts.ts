import { useEffect } from 'react';
import type { Block } from '../types';
import { collectFonts } from '../lib/html-export/collectFonts';

export function useDynamicFonts(blocks: Block[]) {
  useEffect(() => {
    const usedFonts = collectFonts(blocks);

    const id = 'page-builder-dynamic-fonts';
    let link = document.getElementById(id) as HTMLLinkElement;
    if (usedFonts.size > 0) {
      if (!link) {
        link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      const families = Array.from(usedFonts)
        .map((f) => `${f.replace(/ /g, '+')}:wght@300;400;500;600;700`)
        .join('&family=');
      link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
    } else if (link) {
      link.remove();
    }
  }, [blocks]);
}
