const SCRIPT_ID_PREFIX = "zbc-adsense-";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

const loadedClients = new Set<string>();
const loadingClients = new Map<string, Promise<void>>();

function normalizeClientId(clientId: string): string {
  return clientId.trim();
}

/**
 * Loads the AdSense library once per publisher client (ca-pub-…).
 * Safe to call from multiple AdUnit mounts.
 */
export function loadAdSenseScript(clientId: string): Promise<void> {
  const client = normalizeClientId(clientId);
  if (!client || typeof document === "undefined") {
    return Promise.resolve();
  }

  if (loadedClients.has(client)) {
    return Promise.resolve();
  }

  const existing = loadingClients.get(client);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const scriptId = `${SCRIPT_ID_PREFIX}${client}`;
    const already = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (already) {
      loadedClients.add(client);
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    script.onload = () => {
      loadedClients.add(client);
      loadingClients.delete(client);
      resolve();
    };
    script.onerror = () => {
      loadingClients.delete(client);
      reject(new Error("Failed to load AdSense script"));
    };
    document.head.appendChild(script);
  });

  loadingClients.set(client, promise);
  return promise;
}

/** Request AdSense to fill the most recently mounted `<ins class="adsbygoogle">`. */
export function pushAdSenseUnit(): void {
  if (typeof window === "undefined") return;
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    // AdSense may throw if the unit was already filled (e.g. Strict Mode remount).
  }
}
