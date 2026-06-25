const CHUNK_RELOAD_STORAGE_KEY = "zbc-chunk-reload-attempt";

const CHUNK_LOAD_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk [\w-]+ failed/i;

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return CHUNK_LOAD_ERROR_PATTERN.test(message);
}

export function clearChunkReloadAttempt(): void {
  sessionStorage.removeItem(CHUNK_RELOAD_STORAGE_KEY);
}

export function reloadOnceForStaleChunk(): boolean {
  const hasReloaded = sessionStorage.getItem(CHUNK_RELOAD_STORAGE_KEY) === "true";
  if (hasReloaded) {
    sessionStorage.removeItem(CHUNK_RELOAD_STORAGE_KEY);
    return false;
  }

  sessionStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, "true");
  window.location.reload();
  return true;
}
