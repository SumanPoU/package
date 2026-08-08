import { Map } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { MapContentFields } from './MapContentFields';
import { MapElement } from './MapElement';
import { renderMapToHtml } from './map.render';
import { MapPropsSchema } from './map.types';

registerBlock({
  type: 'map',
  label: 'Google Maps',
  icon: Map,
  category: 'embeds',
  defaultProps: { address: 'New York, NY' },
  translatableProps: ['address'],
  sharedProps: [],
  CanvasComponent: MapElement,
  ContentFields: MapContentFields,
  renderToHtml: renderMapToHtml,
  propsSchema: MapPropsSchema,
});
