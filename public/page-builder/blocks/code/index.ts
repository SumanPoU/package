import { FileCode } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { CodeContentFields } from './CodeContentFields';
import { CodeElement } from './CodeElement';
import { renderCodeToHtml } from './code.render';
import { CodePropsSchema } from './code.types';

registerBlock({
  type: 'code',
  label: 'Code Block',
  icon: FileCode,
  category: 'embeds',
  defaultProps: {
    code: 'console.log("Hello world");',
    language: 'javascript',
  },
  defaultStyle: {
    width: 'full',
  },
  translatableProps: ['code'],
  sharedProps: ['language'],
  CanvasComponent: CodeElement,
  ContentFields: CodeContentFields,
  renderToHtml: renderCodeToHtml,
  propsSchema: CodePropsSchema,
});
