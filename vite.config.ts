import { defineConfig, Plugin, PluginOption, UserConfig } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { zipFolderPlugin } from "./zipFolderPlugin";
import { VitePWA, VitePWAOptions, ManifestOptions } from "vite-plugin-pwa";
import replace from "@rollup/plugin-replace";

const pwaOptions: Partial<VitePWAOptions> = {
  registerType: "prompt",
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
  const claims = process.env.CLAIMS === "true";
  const reload = process.env.RELOAD_SW === "true";
  const selfDestroying = process.env.SW_DESTROY === "true";

  if (process.env.SW === "true") {
    pwaOptions.srcDir = "src";
    pwaOptions.filename = claims ? "claims-sw.ts" : "prompt-sw.ts";
    pwaOptions.strategies = "injectManifest";
    (pwaOptions.manifest as Partial<ManifestOptions>).name =
      "PWA Inject Manifest";
    (pwaOptions.manifest as Partial<ManifestOptions>).short_name = "PWA Inject";
  }

  if (claims) pwaOptions.registerType = "autoUpdate";

  if (reload) {
    // @ts-expect-error just ignore
    replaceOptions.__RELOAD_SW__ = "true";
  }

  if (selfDestroying) pwaOptions.selfDestroying = selfDestroying;

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
