import { PanelsTopLeft } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { HeroContentFields } from './HeroContentFields';
import { HeroElement } from './HeroElement';
import { renderHeroToHtml } from './hero.render';
import { HeroPropsSchema } from './hero.types';

registerBlock({
  type: 'hero',
  label: 'Hero',
  icon: PanelsTopLeft,
  category: 'marketing',
  defaultProps: {
    heading: 'Build something great',
    subheading: 'A short supporting line for your landing page.',
    backgroundImage: '',
    backgroundColor: '#0f172a',
    ctaLabel: 'Get started',
    ctaUrl: '#',
    ctaTarget: '_self',
    alignment: 'center',
    overlayOpacity: '0.45',
  },
  translatableProps: ['heading', 'subheading', 'ctaLabel'],
  sharedProps: [
    'backgroundImage',
    'backgroundColor',
    'ctaUrl',
    'ctaTarget',
    'alignment',
    'overlayOpacity',
  ],
  CanvasComponent: HeroElement,
  ContentFields: HeroContentFields,
  renderToHtml: renderHeroToHtml,
  propsSchema: HeroPropsSchema,
});
