import { Quote } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { QuoteContentFields } from './QuoteContentFields';
import { QuoteElement } from './QuoteElement';
import { renderQuoteToHtml } from './quote.render';
import { QuotePropsSchema } from './quote.types';

registerBlock({
  type: 'quote',
  label: 'Quote',
  icon: Quote,
  category: 'basic',
  defaultProps: { text: 'Quote', author: '' },
  translatableProps: ['text', 'author'],
  sharedProps: [],
  CanvasComponent: QuoteElement,
  ContentFields: QuoteContentFields,
  renderToHtml: renderQuoteToHtml,
  propsSchema: QuotePropsSchema,
});
