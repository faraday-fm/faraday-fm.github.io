import { Plugin } from "vite";
import JSZip from "jszip";
import fs from "node:fs";
import path from "node:path";

export function zipFolderPlugin(): Plugin {
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

        const res = await zip.generateAsync({
          type: "base64",
          compression: "DEFLATE",
        });
        return {
          code: `export default fetch("data:application/octet-binary;base64,${res}").then(res => res.arrayBuffer());`,
        };
      }
    },
  };
}
