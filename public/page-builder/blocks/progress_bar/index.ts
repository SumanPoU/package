import { Activity } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { ProgressBarContentFields } from './ProgressBarContentFields';
import { ProgressBarElement } from './ProgressBarElement';
import { renderProgressBarToHtml } from './progress_bar.render';
import { ProgressBarPropsSchema } from './progress_bar.types';

registerBlock({
  type: 'progress_bar',
  label: 'Progress Bar',
  icon: Activity,
  category: 'basic',
  defaultProps: { percentage: '75', label: 'Completion' },
  translatableProps: ['label'],
  sharedProps: ['percentage'],
  CanvasComponent: ProgressBarElement,
  ContentFields: ProgressBarContentFields,
  renderToHtml: renderProgressBarToHtml,
  propsSchema: ProgressBarPropsSchema,
});
