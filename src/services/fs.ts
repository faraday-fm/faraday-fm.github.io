import { FileSystemProvider, InMemoryFsProvider } from "@frdy/web-ui";
import { unzip } from "unzipit";

const encoder = new TextEncoder();

function dir(fs: FileSystemProvider, name: string) {
  fs.createDirectory(name);
}

function file(fs: FileSystemProvider, name: string, content: string) {
  fs.writeFile(name, encoder.encode(content), {
    create: true,
    overwrite: false,
  });
}

export async function buildFaradayFs() {
  const fs = new InMemoryFsProvider();
  const faradayFs = await import("../assets/faraday-fs?zip");
  const buf = await faradayFs.default;
  const zip = await unzip(buf);
  for (const [name, e] of Object.entries(zip.entries)) {
    if (e.isDirectory) {
      // console.info(name.substring(0, name.length - 1));
      dir(fs, name.substring(0, name.length - 1));
    } else {
      const text = await e.text();
      // console.info("FILE", name, text);
      file(fs, name, text);
    }
  }

  // file(fs, "layout.json5", layout);
  // file(fs, "settings.json5", settings);
  // dir(fs, "icons");
  // file(fs, "icons/package.json", iconsPackageJson);
  // dir(fs, "icons/dist");
  // file(fs, "icons/dist/material-icons.json", materialIconsJson);
  // dir(fs, "icons/icons");
  // file(fs, "icons/icons/audio.svg", iconAudio);
  // file(fs, "icons/icons/file.svg", iconFile);
  // file(fs, "icons/icons/folder.svg", iconFolder);
  // file(fs, "icons/icons/html.svg", iconHtml);
  // file(fs, "icons/icons/image.svg", iconImage);
  // file(fs, "icons/icons/pdf.svg", iconPdf);
  // file(fs, "icons/icons/video.svg", iconVideo);
  // file(fs, "icons/icons/exe.svg", iconExe);
  // file(fs, "icons/icons/markdown.svg", iconMarkdown);
  // file(fs, "icons/icons/json.svg", iconJson);
  return fs;
}

export function buildDemoFs() {
  const fs = new InMemoryFsProvider();
  dir(fs, "faraday.app");
  file(fs, "faraday.app/README.md", "123456789");
  dir(fs, "faraday.app/Releases");
  dir(fs, "faraday.app/Releases/Windows");
  dir(fs, "faraday.app/Releases/Windows/Stable");
  file(fs, "faraday.app/Releases/Windows/Stable/faraday-1.0.exe", "123");
  dir(fs, "faraday.app/Releases/Mac OS");
  dir(fs, "faraday.app/Releases/Mac OS/Stable");
  file(fs, "faraday.app/Releases/Mac OS/Stable/faraday-1.0.pkg", "123");
  dir(fs, "faraday.app/Releases/Linux");
  dir(fs, "faraday.app/Releases/Linux/Stable");
  file(fs, "faraday.app/Releases/Linux/Stable/faraday-1.0.deb", "123");
  dir(fs, "faraday.app/News");
  file(fs, "faraday.app/News/2023-02-01.md", "123");
  dir(fs, "faraday.app/UTF files");
  file(fs, "faraday.app/UTF files/🍣🍺", "🍣🍺");
  file(fs, "faraday.app/UTF files/中国人", "中国人");
  file(fs, "faraday.app/UTF files/יידיש", "יידיש");
  file(fs, "faraday.app/UTF files/Русский", "Русский");
  file(fs, "faraday.app/UTF files/Français", "Français");
  file(fs, "faraday.app/UTF files/عرب", "عرب");
  file(fs, "faraday.app/UTF files/แบบไทย", "แบบไทย");
  file(fs, "faraday.app/UTF files/asd\r\nfgh", "asd\r\nfgh");
  dir(fs, "faraday.app/UTF files/S\\p;e:c'i\"al dir");
  file(
    fs,
    "faraday.app/UTF files/S\\p;e:c'i\"al dir/back\\slash file",
    "back\\slash file"
  );
  return fs;
}
