export type NavItem = {
  id: string;
  label: string;
  indent?: boolean;
};

/** Sidebar mirrors a Puck-style docs IA: intro → start → integrate → API → guides. */
export const DOC_NAV: NavItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "getting-started", label: "Getting started" },
  { id: "install", label: "Installation", indent: true },
  { id: "render-editor", label: "Render the editor", indent: true },
  { id: "render-page", label: "Render the page", indent: true },
  { id: "show-on-site", label: "Show page on your site", indent: true },
  { id: "integrating", label: "Integrating" },
  { id: "component-config", label: "Register blocks", indent: true },
  { id: "layout-blocks", label: "Flex & Grid", indent: true },
  { id: "data-model", label: "Data model", indent: true },
  { id: "localization", label: "Localization", indent: true },
  { id: "author-css", label: "Author CSS / JS", indent: true },
  { id: "images", label: "Images & media", indent: true },
  { id: "background", label: "Background", indent: true },
  { id: "typography", label: "Typography", indent: true },
  { id: "visibility", label: "Visibility", indent: true },
  { id: "data-binding", label: "Data sources", indent: true },
  { id: "feature-toggling", label: "Feature toggling", indent: true },
  { id: "palette-config", label: "Hide groups & blocks", indent: true },
  { id: "viewports-canvas", label: "Canvas & viewports", indent: true },
  { id: "theming", label: "Theming the editor", indent: true },
  { id: "api-reference", label: "API reference" },
  { id: "api-page-builder", label: "PageBuilder", indent: true },
  { id: "api-render", label: "RenderPage / OpenPageView", indent: true },
  { id: "api-register", label: "registerBlock", indent: true },
  { id: "api-host", label: "Host callbacks", indent: true },
  { id: "api-validate", label: "validateAuthorCode", indent: true },
  { id: "guides", label: "Guides" },
  { id: "guide-add-block", label: "Add a block", indent: true },
  { id: "guide-register-block", label: "Register custom block", indent: true },
  { id: "guide-dynamic-blocks", label: "Dynamic blocks", indent: true },
  { id: "guide-blog-card", label: "Dynamic blog card", indent: true },
  { id: "guide-locale", label: "Add a locale", indent: true },
  { id: "guide-custom-css", label: "Custom CSS / JS", indent: true },
  { id: "guide-render-parity", label: "Render parity", indent: true },
  { id: "guide-signed-import", label: "Signed import", indent: true },
];
