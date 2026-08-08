import { Heading1 } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { HeadingContentFields } from './HeadingContentFields';
import { HeadingElement } from './HeadingElement';
import { renderHeadingToHtml } from './heading.render';
import { HeadingPropsSchema } from './heading.types';

registerBlock({
  type: 'heading',
  label: 'Heading',
  icon: Heading1,
  category: 'basic',
  defaultProps: { text: 'New heading', level: '2' },
  translatableProps: ['text'],
  sharedProps: ['level'],
  CanvasComponent: HeadingElement,
  ContentFields: HeadingContentFields,
  renderToHtml: renderHeadingToHtml,
  propsSchema: HeadingPropsSchema,
});
