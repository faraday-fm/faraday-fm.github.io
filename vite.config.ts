import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  if (command === "serve") {
    return {
      plugins: [react()],
      optimizeDeps: { exclude: ["@far-more/web-ui"] },
      resolve: {
        alias: { "@far-more/web-ui": "../../web-ui/dist/far-more-web.esm.js" },
      },
    };
  }
  return {
    plugins: [react()],
  };
});
