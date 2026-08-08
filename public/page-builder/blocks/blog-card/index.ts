import { Newspaper } from 'lucide-react';

import { registerBlock } from '../../core/registry';
import { BlogCardContentFields } from './BlogCardContentFields';
import { BlogCardElement } from './BlogCardElement';
import { BlogCardStyleFields } from './BlogCardStyleFields';
import { renderBlogCardToHtml } from './blog-card.render';
import { BlogCardPropsSchema } from './blog-card.types';

registerBlock({
  type: 'blog-card',
  label: 'Blog Card',
  icon: Newspaper,
  category: 'marketing',
  defaultProps: {
    thumbnail: 'https://placehold.co/800x450',
    title: 'Blog post title',
    excerpt: 'A short excerpt of the article goes here.',
    authorName: '',
    publishDate: '',
    readMoreLabel: 'Read more',
    postUrl: '#',
    category: 'News',
    imageAspectRatio: '16:9',
    linkTarget: '_self',
    cardBackgroundColor: '#ffffff',
    cardBorderColor: '#e5e7eb',
    cardBorderRadius: '12px',
    cardPadding: '20px',
    cardShadow: 'sm',
    hoverEffect: 'lift',
    titleStyle: {},
    excerptStyle: {},
    authorStyle: {},
    dateStyle: {},
    categoryStyle: {},
    readMoreStyle: {},
  },
  translatableProps: ['title', 'excerpt', 'authorName', 'readMoreLabel', 'category'],
  sharedProps: [
    'thumbnail',
    'publishDate',
    'postUrl',
    'linkTarget',
    'imageAspectRatio',
    'cardBackgroundColor',
    'cardBorderColor',
    'cardBorderRadius',
    'cardPadding',
    'cardShadow',
    'hoverEffect',
    'titleStyle',
    'excerptStyle',
    'authorStyle',
    'dateStyle',
    'categoryStyle',
    'readMoreStyle',
  ],
  CanvasComponent: BlogCardElement,
  ContentFields: BlogCardContentFields,
  StyleFields: BlogCardStyleFields,
  renderToHtml: renderBlogCardToHtml,
  propsSchema: BlogCardPropsSchema,
});
