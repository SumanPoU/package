import { Space } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { SpacerContentFields } from './SpacerContentFields';
import { SpacerElement } from './SpacerElement';
import { renderSpacerToHtml } from './spacer.render';
import { SpacerPropsSchema } from './spacer.types';

registerBlock({
  type: 'spacer',
  label: 'Spacer',
  icon: Space,
  category: 'basic',
  defaultProps: { height: '50' },
  translatableProps: [],
  sharedProps: ['height'],
  CanvasComponent: SpacerElement,
  ContentFields: SpacerContentFields,
  renderToHtml: renderSpacerToHtml,
  propsSchema: SpacerPropsSchema,
});
