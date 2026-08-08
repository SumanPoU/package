import { AlertTriangle } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { AlertContentFields } from './AlertContentFields';
import { AlertElement } from './AlertElement';
import { renderAlertToHtml } from './alert.render';
import { AlertPropsSchema } from './alert.types';

registerBlock({
  type: 'alert',
  label: 'Alert',
  icon: AlertTriangle,
  category: 'basic',
  defaultProps: { variant: 'info', title: 'Info', text: 'Alert message' },
  translatableProps: ['title', 'text'],
  sharedProps: ['variant'],
  CanvasComponent: AlertElement,
  ContentFields: AlertContentFields,
  renderToHtml: renderAlertToHtml,
  propsSchema: AlertPropsSchema,
});
