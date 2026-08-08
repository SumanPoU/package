import { Globe } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { IframeContentFields } from './IframeContentFields';
import { IframeElement } from './IframeElement';
import { renderIframeToHtml } from './iframe.render';
import { IframePropsSchema } from './iframe.types';

registerBlock({
  type: 'iframe',
  label: 'Embedded Iframe',
  icon: Globe,
  category: 'embeds',
  defaultProps: { url: 'https://example.com' },
  translatableProps: [],
  sharedProps: ['url'],
  CanvasComponent: IframeElement,
  ContentFields: IframeContentFields,
  renderToHtml: renderIframeToHtml,
  propsSchema: IframePropsSchema,
});
