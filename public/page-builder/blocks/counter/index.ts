import { Hash } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { CounterContentFields } from './CounterContentFields';
import { CounterElement } from './CounterElement';
import { renderCounterToHtml } from './counter.render';
import { CounterPropsSchema } from './counter.types';

registerBlock({
  type: 'counter',
  label: 'Counter',
  icon: Hash,
  category: 'basic',
  defaultProps: { targetNumber: '100', label: 'Counter' },
  translatableProps: ['label'],
  sharedProps: ['targetNumber'],
  CanvasComponent: CounterElement,
  ContentFields: CounterContentFields,
  renderToHtml: renderCounterToHtml,
  propsSchema: CounterPropsSchema,
});
