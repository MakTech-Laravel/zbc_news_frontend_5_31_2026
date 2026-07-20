/**
 * Builds a self-contained document for manual ad HTML / iframe embeds.
 * Content scrolls inside the iframe when it exceeds the placement box.
 */
export function buildManualAdSrcDoc(rawHtml: string): string {
  const body = rawHtml.trim();
  if (!body) return "";

  // Escape closing script/style breakouts in a minimal way is not needed —
  // this HTML is admin-authored and isolated in a sandboxed iframe.
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background: transparent;
  }
  body {
    box-sizing: border-box;
  }
  *, *::before, *::after { box-sizing: border-box; }
</style>
</head>
<body>${body}</body>
</html>`;
}

export function hasManualAdHtml(html?: string | null): boolean {
  return Boolean(html?.trim());
}
