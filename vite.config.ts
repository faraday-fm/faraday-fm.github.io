import { defineConfig, Plugin, UserConfig } from "vite";
import JSZip from "jszip";
import path from "node:path";
import react from "@vitejs/plugin-react";
import fs from "node:fs";

function zipFolderPlugin(): Plugin {
  const buildZip = (dir: string, zip: JSZip) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((dirent) => {
      const direntPath = path.join(dir, dirent.name);
      if (dirent.isFile()) {
        zip.file(dirent.name, fs.readFileSync(direntPath));
      } else {
        const nextDir = zip.folder(dirent.name);
        buildZip(direntPath, nextDir);
      }
    });
  };
  return {
    name: "zip-folder",
    async resolveId(source, importer) {
      if (source.endsWith("?zip")) {
        return { id: path.join(path.dirname(importer), source) };
      }
    },
    async load(id) {
      if (id.endsWith("?zip")) {
        const folder = id.substring(0, id.lastIndexOf("?"));
        const zip = new JSZip();
        buildZip(folder, zip);

        const res = await zip.generateAsync({ type: "base64" });
        return {
          code: `export default fetch("data:application/octet-binary;base64,${res}").then(res => res.arrayBuffer());`,
        };
      }
    },
  };
}

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
