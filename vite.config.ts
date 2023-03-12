import { defineConfig } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      plugins: [react()],
      optimizeDeps: { exclude: ["@far-more/web-ui"] },
      resolve: {
        alias: { "@far-more/web-ui": path.join(__dirname, "../web-ui/dist/far-more-web.esm.js") },
      },
    };
  }
  return {
    plugins: [react()],
  };
});
