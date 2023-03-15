import { FileSystemProvider, InMemoryFsProvider } from "@frdy/web-ui";
import { randFileExt, randFileName, randLine } from "@ngneat/falso";
import materialIconsJson from "./faraday/icons/dist/material-icons.json?raw";
import iconAudio from "./faraday/icons/icons/audio.svg?raw";
import iconExe from "./faraday/icons/icons/exe.svg?raw";
import iconFile from "./faraday/icons/icons/file.svg?raw";
import iconFolder from "./faraday/icons/icons/folder.svg?raw";
import iconHtml from "./faraday/icons/icons/html.svg?raw";
import iconImage from "./faraday/icons/icons/image.svg?raw";
import iconJson from "./faraday/icons/icons/json.svg?raw";
import iconMarkdown from "./faraday/icons/icons/markdown.svg?raw";
import iconPdf from "./faraday/icons/icons/pdf.svg?raw";
import iconVideo from "./faraday/icons/icons/video.svg?raw";
import iconsPackageJson from "./faraday/icons/package.json?raw";
import layout from "./faraday/layout.json5?raw";
import settings from "./faraday/settings.json5?raw";

const encoder = new TextEncoder();

function createManyFiles(count: number) {
  const result: string[] = [];
  const filenames = new Set<string>();
  for (let i = 0; i < count; i++) {
    const fn = randFileName({ extension: randFileExt() });
    if (!filenames.has(fn)) {
      filenames.add(fn);
      result.push(fn);
    }
  }
  return result;
}

function dir(fs: FileSystemProvider, name: string) {
  fs.createDirectory(name);
}

function file(fs: FileSystemProvider, name: string, content: string) {
  fs.writeFile(name, encoder.encode(content), {
    create: true,
    overwrite: false,
  });
}

export function buildFarMoreFs() {
  const fs = new InMemoryFsProvider();
  file(fs, "layout.json5", layout);
  file(fs, "settings.json5", settings);
  dir(fs, "icons");
  file(fs, "icons/package.json", iconsPackageJson);
  dir(fs, "icons/dist");
  file(fs, "icons/dist/material-icons.json", materialIconsJson);
  dir(fs, "icons/icons");
  file(fs, "icons/icons/audio.svg", iconAudio);
  file(fs, "icons/icons/file.svg", iconFile);
  file(fs, "icons/icons/folder.svg", iconFolder);
  file(fs, "icons/icons/html.svg", iconHtml);
  file(fs, "icons/icons/image.svg", iconImage);
  file(fs, "icons/icons/pdf.svg", iconPdf);
  file(fs, "icons/icons/video.svg", iconVideo);
  file(fs, "icons/icons/exe.svg", iconExe);
  file(fs, "icons/icons/markdown.svg", iconMarkdown);
  file(fs, "icons/icons/json.svg", iconJson);
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
  dir(fs, "faraday.app/Many Files");
  createManyFiles(1000).forEach((fn) =>
    file(fs, "faraday.app/Many Files/" + fn, randomContent())
  );
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

function randomContent(): string {
  const lineCount = (1 + Math.random() * 20) | 0;
  let content = randLine({ lineCount });
  return content;
}
