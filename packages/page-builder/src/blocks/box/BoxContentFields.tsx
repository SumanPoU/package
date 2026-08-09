"use client";

import type { BlockContentFieldsProps } from "../../core/types";
import { ContainerBackgroundFields } from "../ContainerBackgroundFields";

export const BoxContentFields = ({
  block,
  onChange,
}: BlockContentFieldsProps) => (
  <ContainerBackgroundFields
    block={block}
    onChange={onChange}
    idPrefix={`pb-box-${block.id}`}
  />
);
