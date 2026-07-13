import { reactRouter } from "@react-router/dev/vite";
// NOTE: Do NOT add @vitejs/plugin-react's `react()` plugin here. Running it
// alongside reactRouter() double-injects the Fast Refresh runtime and throws
// "Identifier 'RefreshRuntime' has already been declared" in `npm run dev`,
// hanging the page (weather widget / ad slots never resolve). reactRouter()
// already provides the React transform + Fast Refresh. React Compiler is still
// enabled via reactCompilerPreset() below (its babel preset, not the plugin).
import { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";

export default {
  build: {
    chunkSizeWarningLimit: 700,
  },
  plugins: [
    reactRouter(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
};
