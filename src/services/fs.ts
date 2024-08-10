import { unzip } from "unzipit";
import faradayAppFs from "../assets/faraday.app?zip";
import { MemoryFsProvider } from "@frdy/memory-fs";
import { AceMask, FileType, Flags, type FileSystemProvider } from "@frdy/sdk";

async function dir(fs: FileSystemProvider, name: string, lastModDate: Date) {
  await fs.mkdir(name, {
    type: FileType.DIRECTORY,
    mtime: lastModDate.getTime(),
  });
}

async function file(
  fs: FileSystemProvider,
  name: string,
  lastModDate: Date,
  content: ArrayBuffer
) {
  const handle = await fs.open(
    name,
    AceMask.WRITE_DATA,
    Flags.CREATE_TRUNCATE,
    { type: FileType.REGULAR, mtime: lastModDate.getTime(), }
  );
  fs.write(handle, 0, new Uint8Array(content));
}

async function buildFromZip(buf: ArrayBuffer) {
  const fs = new MemoryFsProvider();
  const zip = await unzip(buf);
  for (const [name, e] of Object.entries(zip.entries)) {
    if (e.isDirectory) {
      dir(fs, name.substring(0, name.length - 1), e.lastModDate);
    } else {
      const text = await e.arrayBuffer();
      file(fs, name, e.lastModDate, text);
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
