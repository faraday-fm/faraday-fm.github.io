import { defineConfig, Plugin, PluginOption, UserConfig } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { zipFolderPlugin } from "./zipFolderPlugin";
import { VitePWA, VitePWAOptions, ManifestOptions } from "vite-plugin-pwa";
import replace from "@rollup/plugin-replace";

const pwaOptions: Partial<VitePWAOptions> = {
  registerType: "autoUpdate",
  injectRegister: "inline",
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
    maximumFileSizeToCacheInBytes: 10000000,
  },
  includeAssets: ["faraday.svg", "faraday_180.png", "faraday-mask.svg"],
  devOptions: {
    enabled: true,
  },
  minify: true,
  manifest: {
    name: "Faraday",
    short_name: "Faraday",
    description: "Faraday file manager",
    theme_color: "#1e1e1e",
    background_color: "#1e1e1e",
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
};

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const localLibs = process.env.LOCAL_LIBS === "true";

  const replaceOptions = { __DATE__: new Date().toISOString() };

  const plugins: PluginOption[] = [
    react(),
    zipFolderPlugin(),
    replace(replaceOptions) as any,
    VitePWA(pwaOptions),
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
