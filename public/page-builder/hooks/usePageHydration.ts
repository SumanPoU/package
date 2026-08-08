import { useRef, useEffect, type Dispatch, type SetStateAction } from 'react';
import { ZodError } from 'zod';
import type { Block } from '../types';
import type { Metadata } from '@/validations/common';
import { useToast } from '@/components/ui/use-toast';
import { migrateBlockStyle } from '../migrations/styleMigration';
import {
  resolveBlockTree,
  parseStoredBlocks,
  stripUnregisteredBlockTypes,
} from '../blockTreeHelpers';
import { validateBlockTree, formatBlockTreeValidationError } from '../core/schema/block.schema';
import { LANG_FIELD_MAP } from '../langFieldMap';

type ExistingPage = {
  id: string | number;
  title?: string | null;
  title_np?: string | null;
  description?: string | null;
  description_np?: string | null;
  metadata?: Metadata | string | null;
  status?: boolean | number | null;
};

export function usePageHydration(
  isEditMode: boolean,
  existingPage: ExistingPage | undefined | null,
  isLoadingPage: boolean,
  currentLang: string,
  setPageId: (id: string | number) => void,
  setPageNameI18n: Dispatch<SetStateAction<Record<string, string>>>,
  setBlocks: Dispatch<SetStateAction<Block[]>>,
  setMetadata: Dispatch<SetStateAction<Metadata>>,
  setStatus: (status: boolean) => void,
) {
  const hydratedRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isEditMode || !existingPage || hydratedRef.current) return;
    hydratedRef.current = true;

    setPageId(existingPage.id);
    const hydratedNames: Record<string, string> = {};
    LANG_FIELD_MAP.forEach(({ code, titleField }) => {
      const value = titleField === 'title' ? existingPage.title : existingPage.title_np;
      hydratedNames[code] = value ?? (titleField === 'title' ? 'Untitled page' : '');
    });
    setPageNameI18n(hydratedNames);

    try {
      const parsed = parseStoredBlocks(existingPage.description ?? existingPage.description_np);
      const migrated = parsed.map((item) => migrateBlockStyle(item as Block));
      const stripped = stripUnregisteredBlockTypes(migrated);
      const validated = validateBlockTree(stripped);
      setBlocks(validated.map((b) => resolveBlockTree(b, currentLang)));
    } catch (error) {
      const description =
        error instanceof ZodError
          ? formatBlockTreeValidationError(error)
          : error instanceof Error
            ? error.message
            : 'Page content could not be loaded.';

      toast({
        variant: 'destructive',
        title: 'Could not load page content',
        description,
      });
    }

    if (existingPage.metadata) {
      if (typeof existingPage.metadata === 'string') {
        try {
          setMetadata(JSON.parse(existingPage.metadata));
        } catch {
          // ignore malformed metadata
        }
      } else {
        setMetadata(existingPage.metadata as Metadata);
      }
    }

    if (typeof existingPage.status !== 'undefined') {
      setStatus(Boolean(existingPage.status));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existingPage]);

  const showLoading = isEditMode && isLoadingPage && !hydratedRef.current;

  return { hydratedRef, showLoading };
}
