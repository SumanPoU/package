import { Columns3 } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { GridContentFields } from './GridContentFields';
import { GridElement } from './GridElement';
import { renderGridToHtml } from './grid.render';
import { GridPropsSchema } from './grid.types';

registerBlock({
  type: 'grid',
  label: 'Grid',
  icon: Columns3,
  category: 'layout',
  isContainer: true,
  defaultProps: {},
  defaultStyle: {
    columns: 2,
    width: 'full',
    height: 'auto',
    customHeight: '400',
  },
  translatableProps: [],
  sharedProps: [],
  CanvasComponent: GridElement,
  ContentFields: GridContentFields,
  renderToHtml: renderGridToHtml,
  propsSchema: GridPropsSchema,
});
