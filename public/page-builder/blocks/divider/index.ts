import { Minus } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { DividerContentFields } from './DividerContentFields';
import { DividerElement } from './DividerElement';
import { renderDividerToHtml } from './divider.render';
import { DividerPropsSchema } from './divider.types';

registerBlock({
  type: 'divider',
  label: 'Divider',
  icon: Minus,
  category: 'basic',
  defaultProps: {},
  translatableProps: [],
  sharedProps: [],
  CanvasComponent: DividerElement,
  ContentFields: DividerContentFields,
  renderToHtml: renderDividerToHtml,
  propsSchema: DividerPropsSchema,
});
