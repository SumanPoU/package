import { ListOrdered } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { ListContentFields } from './ListContentFields';
import { ListElement } from './ListElement';
import { renderListToHtml } from './list.render';
import { ListPropsSchema } from './list.types';

registerBlock({
  type: 'list',
  label: 'List',
  icon: ListOrdered,
  category: 'basic',
  defaultProps: { items: 'First item\nSecond item\nThird item', listType: 'unordered' },
  translatableProps: ['items'],
  sharedProps: ['listType'],
  CanvasComponent: ListElement,
  ContentFields: ListContentFields,
  renderToHtml: renderListToHtml,
  propsSchema: ListPropsSchema,
});
