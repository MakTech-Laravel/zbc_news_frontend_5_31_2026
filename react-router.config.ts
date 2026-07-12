import type { Config } from "@react-router/dev/config";

export default {
  // Public content routes are server-rendered so crawlers get real HTML.
  ssr: true,
  // Keep the existing src/ layout instead of moving everything to app/.
  appDirectory: "src",
} satisfies Config;
