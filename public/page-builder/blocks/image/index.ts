import { ImageIcon } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { ImageContentFields } from './ImageContentFields';
import { ImageElement } from './ImageElement';
import { renderImageToHtml } from './image.render';
import { ImagePropsSchema } from './image.types';

registerBlock({
  type: 'image',
  label: 'Image',
  icon: ImageIcon,
  category: 'basic',
  defaultProps: { src: 'https://placehold.co/800x400', alt: 'Placeholder' },
  translatableProps: ['alt'],
  sharedProps: ['src'],
  CanvasComponent: ImageElement,
  ContentFields: ImageContentFields,
  renderToHtml: renderImageToHtml,
  propsSchema: ImagePropsSchema,
});
