import { AppWindow } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { IconBoxContentFields } from './IconBoxContentFields';
import { IconBoxElement } from './IconBoxElement';
import { renderIconBoxToHtml } from './icon_box.render';
import { IconBoxPropsSchema } from './icon_box.types';

registerBlock({
  type: 'icon_box',
  label: 'Icon Box',
  icon: AppWindow,
  category: 'basic',
  defaultProps: { iconName: 'Star', title: 'Icon Box', description: 'Description goes here' },
  translatableProps: ['title', 'description'],
  sharedProps: ['iconName'],
  CanvasComponent: IconBoxElement,
  ContentFields: IconBoxContentFields,
  renderToHtml: renderIconBoxToHtml,
  propsSchema: IconBoxPropsSchema,
});
