import { lazy, type ComponentType, type LazyExoticComponent } from "react";

import { isChunkLoadError, reloadOnceForStaleChunk } from "@/lib/chunkLoadError";

type ModuleWithDefault<T extends ComponentType> = { default: T };

export function lazyWithRetry<T extends ComponentType>(
  importer: () => Promise<ModuleWithDefault<T>>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await importer();
    } catch (error) {
      if (isChunkLoadError(error) && reloadOnceForStaleChunk()) {
        return new Promise<ModuleWithDefault<T>>(() => undefined);
      }

      throw error;
    }
  });
}
