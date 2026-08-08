import { Code } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { HtmlContentFields } from './HtmlContentFields';
import { HtmlElement } from './HtmlElement';
import { renderHtmlToHtml } from './html.render';
import { HtmlPropsSchema } from './html.types';

registerBlock({
  type: 'html',
  label: 'HTML Embed',
  icon: Code,
  category: 'embeds',
  defaultProps: { code: '<div>Custom HTML goes here</div>' },
  translatableProps: ['code'],
  sharedProps: [],
  CanvasComponent: HtmlElement,
  ContentFields: HtmlContentFields,
  renderToHtml: renderHtmlToHtml,
  propsSchema: HtmlPropsSchema,
});
