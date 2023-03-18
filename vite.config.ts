import { defineConfig, Plugin, UserConfig } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { zipFolderPlugin } from "./zipFolderPlugin";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const localLibs = process.env.LOCAL_LIBS === "true";

  const plugins = [react(), zipFolderPlugin()];

  let config: UserConfig = {
    plugins,
    build: {
      target: "esnext",
    },
  };

  if (localLibs) {
    config = {
      ...config,
      optimizeDeps: { exclude: ["@frdy/web-ui"] },
      resolve: {
        alias: {
          "@frdy/web-ui": path.join(__dirname, "../web-ui/dist/index.esm.js"),
        },
      },
    };
  }

  return config;
});
