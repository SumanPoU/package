import { Box } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { ContainerContentFields } from './ContainerContentFields';
import { ContainerElement } from './ContainerElement';
import { renderContainerToHtml } from './container.render';
import { ContainerPropsSchema } from './container.types';

registerBlock({
  type: 'container',
  label: 'Container',
  icon: Box,
  category: 'layout',
  isContainer: true,
  defaultProps: {},
  defaultStyle: {
    width: 'boxed',
    height: 'auto',
    customHeight: '400',
  },
  translatableProps: [],
  sharedProps: [],
  CanvasComponent: ContainerElement,
  ContentFields: ContainerContentFields,
  renderToHtml: renderContainerToHtml,
  propsSchema: ContainerPropsSchema,
});
