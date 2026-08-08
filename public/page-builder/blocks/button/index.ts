import { Square } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { ButtonContentFields } from './ButtonContentFields';
import { ButtonElement } from './ButtonElement';
import { renderButtonToHtml } from './button.render';
import { ButtonPropsSchema } from './button.types';

registerBlock({
  type: 'button',
  label: 'Button',
  icon: Square,
  category: 'basic',
  // href/target included so sharedProps keys type-check; empty href keeps non-link behavior
  defaultProps: { text: 'Click me', href: '', target: '_self' },
  translatableProps: ['text'],
  sharedProps: ['href', 'target'],
  CanvasComponent: ButtonElement,
  ContentFields: ButtonContentFields,
  renderToHtml: renderButtonToHtml,
  propsSchema: ButtonPropsSchema,
});
