import { FileSystemProvider, InMemoryFsProvider } from "@frdy/web-ui";
import { unzip } from "unzipit";
import faradayAppFs from "../assets/faraday.app?zip";

const encoder = new TextEncoder();

function dir(fs: FileSystemProvider, name: string) {
  fs.createDirectory(name);
}

function file(fs: FileSystemProvider, name: string, content: ArrayBuffer) {
  fs.writeFile(name, new Uint8Array(content), {
    create: true,
    overwrite: false,
  });
}

async function buildFromZip(buf: ArrayBuffer) {
  const fs = new InMemoryFsProvider();
  const zip = await unzip(buf);
  for (const [name, e] of Object.entries(zip.entries)) {
    if (e.isDirectory) {
      // console.info(name.substring(0, name.length - 1));
      dir(fs, name.substring(0, name.length - 1));
    } else {
      const text = await e.arrayBuffer();
      // console.info("FILE", name, text);
      file(fs, name, text);
    }
  }
  return fs;
}

export async function buildFaradayFs() {
  const faradayFs = await import("../assets/faraday-fs?zip");
  const buf = await faradayFs.default;
  return buildFromZip(buf);
}

export async function buildDemoFs() {
  const buf = await faradayAppFs;
  return buildFromZip(buf);
}
