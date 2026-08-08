import { Tag } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { BadgeContentFields } from './BadgeContentFields';
import { BadgeElement } from './BadgeElement';
import { renderBadgeToHtml } from './badge.render';
import { BadgePropsSchema } from './badge.types';

registerBlock({
  type: 'badge',
  label: 'Badge',
  icon: Tag,
  category: 'basic',
  defaultProps: { text: 'New' },
  translatableProps: ['text'],
  sharedProps: [],
  CanvasComponent: BadgeElement,
  ContentFields: BadgeContentFields,
  renderToHtml: renderBadgeToHtml,
  propsSchema: BadgePropsSchema,
});
