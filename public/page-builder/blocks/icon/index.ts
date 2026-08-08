import { Smile } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { IconContentFields } from './IconContentFields';
import { IconElement } from './IconElement';
import { renderIconToHtml } from './icon.render';
import { IconPropsSchema } from './icon.types';

registerBlock({
  type: 'icon',
  label: 'Icon',
  icon: Smile,
  category: 'basic',
  defaultProps: { iconName: 'Smile' },
  translatableProps: [],
  sharedProps: ['iconName'],
  CanvasComponent: IconElement,
  ContentFields: IconContentFields,
  renderToHtml: renderIconToHtml,
  propsSchema: IconPropsSchema,
});
