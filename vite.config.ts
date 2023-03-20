import { defineConfig, Plugin, UserConfig } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { zipFolderPlugin } from "./zipFolderPlugin";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const localLibs = process.env.LOCAL_LIBS === "true";

  const plugins = [
    react(),
    zipFolderPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "inline",
      // workbox: {
      //   globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      // },
      includeAssets: ["faraday.svg", "faraday_180.png", "faraday-mask.svg"],
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Faraday",
        short_name: "Faraday",
        description: "Faraday file manager",
        theme_color: "#1e1e1e",
        icons: [
          {
            src: "faraday_512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "faraday_512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ];

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
