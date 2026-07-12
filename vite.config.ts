import { reactRouter } from "@react-router/dev/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";

export default {
  build: {
    chunkSizeWarningLimit: 700,
  },
  plugins: [
    reactRouter(),
    // react(),
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
