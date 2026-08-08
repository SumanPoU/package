import { Video } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { VideoContentFields } from './VideoContentFields';
import { VideoElement } from './VideoElement';
import { renderVideoToHtml } from './video.render';
import { VideoPropsSchema } from './video.types';

registerBlock({
  type: 'video',
  label: 'Video',
  icon: Video,
  category: 'basic',
  defaultProps: { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  translatableProps: [],
  sharedProps: ['url'],
  CanvasComponent: VideoElement,
  ContentFields: VideoContentFields,
  renderToHtml: renderVideoToHtml,
  propsSchema: VideoPropsSchema,
});
