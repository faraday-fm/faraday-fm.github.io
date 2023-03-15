import { defineConfig } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      plugins: [react()],
      optimizeDeps: { exclude: ["@frdy/web-ui"] },
      resolve: {
        alias: { "@frdy/web-ui": path.join(__dirname, "../web-ui/dist/index.esm.js") },
      },
    };
  }
  return {
    plugins: [react()],
  };
});
