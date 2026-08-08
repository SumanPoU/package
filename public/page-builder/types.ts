export type ComponentType =
  // Layout
  | 'container'
  | 'grid'
  | 'flex'
  // Basic
  | 'heading'
  | 'text'
  | 'image'
  | 'button'
  | 'list'
  | 'divider'
  | 'spacer'
  | 'icon'
  | 'icon_box'
  | 'video'
  | 'star_rating'
  | 'counter'
  | 'progress_bar'
  | 'badge'
  | 'quote'
  | 'alert'
  // Marketing
  | 'nav'
  | 'hero'
  | 'blog-card'
  // Embeds
  | 'html'
  | 'code'
  | 'map'
  | 'iframe';

export type Device = 'desktop' | 'tablet' | 'mobile';
export type Category = 'basic' | 'layout' | 'marketing' | 'embeds';
export type DeviceVisibility = Record<Device, boolean>;

export type SpacingUnit = 'px' | 'em' | 'rem' | '%';

export type SpacingValue = {
  top: string;
  right: string;
  bottom: string;
  left: string;
  unit: SpacingUnit;
  linked: boolean;
};

export type BorderRadiusValue = {
  topLeft: string;
  topRight: string;
  bottomRight: string;
  bottomLeft: string;
  unit: 'px' | 'em' | '%';
  linked: boolean;
};

export type BoxShadow = {
  enabled: boolean;
  x: string;
  y: string;
  blur: string;
  spread: string;
  color: string;
  inset: boolean;
};

export type DimensionUnit = 'px' | '%' | 'auto' | 'vh' | 'vw';

export type DimensionValue = {
  value: number | null;
  unit: DimensionUnit;
};

export type GapValue = {
  row: number | null;
  column: number | null;
  linked: boolean;
  unit: 'px' | 'em' | 'rem' | 'vw' | 'vh';
};

export type AdvancedStyle = {
  align: 'left' | 'center' | 'right';
  paddingY: 'none' | 'sm' | 'md' | 'lg';
  bg: 'none' | 'gray' | 'dark'; // legacy bg
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gridTemplateColumns?: string;

  // Flexbox Properties
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  justifyContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignItems?: 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline';
  gap?: GapValue;

  // legacy dimensions, pre-migration
  width?: 'full' | 'boxed';
  height?: 'auto' | 'full' | 'custom';
  customHeight?: string;

  // New dimension objects
  dimWidth?: DimensionValue;
  dimHeight?: DimensionValue;
  minWidth?: DimensionValue;
  maxWidth?: DimensionValue;
  minHeight?: DimensionValue;
  maxHeight?: DimensionValue;

  margin: SpacingValue;
  padding: SpacingValue;

  // Typography
  fontFamily?: string;
  fontSize: string;
  fontSizeUnit: 'px' | 'em' | 'rem' | 'vw';
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  letterSpacingUnit: 'px' | 'em';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration: 'none' | 'underline' | 'line-through';
  textColor: string;

  // Background
  backgroundColor: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: string;
  backgroundRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  backgroundOverlay?: { color: string; opacity: number } | null;

  borderWidth: SpacingValue;
  borderStyle: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  borderColor: string;
  borderRadius: BorderRadiusValue;
  opacity: string;
  boxShadow: BoxShadow;
  customCSS: string;

  // Image block
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  filterBlur?: string;
  imageShadowPreset?: 'none' | 'soft' | 'medium' | 'strong' | 'custom';
};

export type ResponsiveOverrides = Partial<Record<Device, Partial<AdvancedStyle>>>;

export type I18nProps = Record<string, Record<string, string>>;

export type Block = {
  id: string;
  type: ComponentType;
  props: Record<string, string>;
  i18nProps: I18nProps;
  style: AdvancedStyle;
  visibility: DeviceVisibility;
  responsiveStyle: ResponsiveOverrides;
  repeatableItems?: { id: string; props: Record<string, string> }[];
  children?: Block[];
};
