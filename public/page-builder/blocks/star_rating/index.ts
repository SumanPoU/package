import { Star } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { StarRatingContentFields } from './StarRatingContentFields';
import { StarRatingElement } from './StarRatingElement';
import { renderStarRatingToHtml } from './star_rating.render';
import { StarRatingPropsSchema } from './star_rating.types';

registerBlock({
  type: 'star_rating',
  label: 'Star Rating',
  icon: Star,
  category: 'basic',
  defaultProps: { rating: '4', maxRating: '5' },
  translatableProps: [],
  sharedProps: ['rating', 'maxRating'],
  CanvasComponent: StarRatingElement,
  ContentFields: StarRatingContentFields,
  renderToHtml: renderStarRatingToHtml,
  propsSchema: StarRatingPropsSchema,
});
