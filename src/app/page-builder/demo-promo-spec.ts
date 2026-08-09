import type { DynamicBlockSpec } from "@itzsa/page-builder";

/** Demo Model B block — composition of primitives only (no custom render). */
export const DEMO_PROMO_SPEC: DynamicBlockSpec = {
  type: "tenant:promo",
  label: "Promo",
  category: "basic",
  source: "tenant",
  fields: [
    {
      key: "title",
      kind: "text",
      label: "Title",
      translatable: true,
      defaultValue: "Special offer",
    },
    {
      key: "body",
      kind: "richText",
      label: "Body",
      translatable: true,
      defaultValue: "<p>Limited time — compose from primitives.</p>",
    },
    {
      key: "image",
      kind: "image",
      label: "Image URL",
      defaultValue: "https://picsum.photos/seed/pb-promo/640/360",
    },
    { key: "href", kind: "url", label: "Link", defaultValue: "#" },
  ],
  template: [
    {
      type: "box",
      props: { as: "section" },
      children: [
        {
          type: "image",
          props: { src: "{{props.image}}", alt: "Promo" },
        },
        {
          type: "heading",
          props: { level: "h3" },
          i18nProps: { en: { title: "{{props.title}}" } },
        },
        {
          type: "text",
          i18nProps: { en: { html: "{{props.body}}" } },
        },
        {
          type: "button",
          props: { href: "{{props.href}}" },
          i18nProps: { en: { label: "Learn more" } },
        },
      ],
    },
  ],
};
