import { Menu } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { NavContentFields } from './NavContentFields';
import { NavElement } from './NavElement';
import { renderNavToHtml } from './nav.render';
import { NavPropsSchema } from './nav.types';

registerBlock({
  type: 'nav',
  label: 'Navigation Menu',
  icon: Menu,
  category: 'marketing',
  defaultProps: { links: 'Home,/\nAbout,/about\nContact,/contact' },
  translatableProps: ['links'],
  sharedProps: [],
  CanvasComponent: NavElement,
  ContentFields: NavContentFields,
  renderToHtml: renderNavToHtml,
  propsSchema: NavPropsSchema,
});
