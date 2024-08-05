import { FileSystemProvider, InMemoryFsProvider } from "@frdy/web-ui";
import { unzip } from "unzipit";
import faradayAppFs from "../assets/faraday.app?zip";
import { AceMask, FileType, Flags } from "@frdy/web-ui";

const encoder = new TextEncoder();

async function dir(fs: FileSystemProvider, name: string) {
  await fs.mkdir(name, { type: FileType.SSH_FILEXFER_TYPE_DIRECTORY });
}

async function file(
  fs: FileSystemProvider,
  name: string,
  content: ArrayBuffer
) {
  const handle = await fs.open(
    name,
    AceMask.ACE4_WRITE_DATA,
    Flags.SSH_FXF_CREATE_TRUNCATE,
    undefined
  );
  fs.write(handle, 0, new Uint8Array(content));
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
