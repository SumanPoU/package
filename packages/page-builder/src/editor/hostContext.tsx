"use client";

import { createContext, use } from "react";

/** Host uploads a file and returns a public URL (CDN / media API). */
export type UploadAsset = (file: File) => Promise<{ url: string }>;

export type PageBuilderHostValue = {
  uploadAsset?: UploadAsset;
};

const PageBuilderHostContext = createContext<PageBuilderHostValue>({});

export const PageBuilderHostProvider = PageBuilderHostContext.Provider;

export const usePageBuilderHost = (): PageBuilderHostValue =>
  use(PageBuilderHostContext);
