import { Type } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { TextContentFields } from './TextContentFields';
import { TextElement } from './TextElement';
import { renderTextToHtml } from './text.render';
import { TextPropsSchema } from './text.types';

registerBlock({
  type: 'text',
  label: 'Text',
  icon: Type,
  category: 'basic',
  defaultProps: { text: 'Some descriptive text goes here.' },
  translatableProps: ['text'],
  sharedProps: [],
  CanvasComponent: TextElement,
  ContentFields: TextContentFields,
  renderToHtml: renderTextToHtml,
  propsSchema: TextPropsSchema,
});
