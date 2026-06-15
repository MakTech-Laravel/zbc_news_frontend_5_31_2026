import { defineConfig, loadEnv } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const apiOrigin = new URL(env.VITE_API_BASE_URL).origin;

  return {
    build: {
      chunkSizeWarningLimit: 700,
    },
    plugins: [
      react(),
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
          target: apiOrigin,
          changeOrigin: true,
        },
      },
    },
  };
});










// import { defineConfig } from "vite";
// import react, { reactCompilerPreset } from "@vitejs/plugin-react";
// import babel from "@rolldown/plugin-babel";
// import path from "node:path";
// import tailwindcss from "@tailwindcss/vite";

// export default defineConfig({

  

//   build: {
//     chunkSizeWarningLimit: 700,
//   },
//   plugins: [
//     react(),
//     babel({ presets: [reactCompilerPreset()] }),
//     tailwindcss(),
//   ],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
//   server: {
//     proxy: {
//       "/api": {
//         target: "http://localhost:8000",
//         changeOrigin: true,
//       },
//     },
//   },
// });
