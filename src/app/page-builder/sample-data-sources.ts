import type { BindingRenderContext } from "@itzsa/page-builder";

/** Demo DataSource for repeater (§25 Strategy A) in create / preview / open. */
export const SAMPLE_DATA_SOURCES: NonNullable<
  BindingRenderContext["dataSources"]
> = {
  sample: {
    state: "ready",
    items: [
      { title: "First post", body: "Hello from item 1", url: "#" },
      { title: "Second post", body: "Hello from item 2", url: "#" },
      { title: "Third post", body: "Hello from item 3", url: "#" },
    ],
  },
};
