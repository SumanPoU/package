import { Rows3 } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { FlexContentFields } from './FlexContentFields';
import { FlexElement } from './FlexElement';
import { renderFlexToHtml } from './flex.render';
import { FlexPropsSchema } from './flex.types';

registerBlock({
  type: 'flex',
  label: 'Flex row',
  icon: Rows3,
  category: 'layout',
  isContainer: true,
  defaultProps: {},
  defaultStyle: {
    width: 'full',
    height: 'auto',
    customHeight: '400',
  },
  translatableProps: [],
  sharedProps: [],
  CanvasComponent: FlexElement,
  ContentFields: FlexContentFields,
  renderToHtml: renderFlexToHtml,
  propsSchema: FlexPropsSchema,
});
