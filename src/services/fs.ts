import { FileSystemProvider, InMemoryFsProvider } from "@far-more/web-ui";
import { randFileExt, randFileName, randLine } from "@ngneat/falso";
import materialIconsJson from "./far-more/icons/dist/material-icons.json?raw";
import iconAudio from "./far-more/icons/icons/audio.svg?raw";
import iconExe from "./far-more/icons/icons/exe.svg?raw";
import iconFile from "./far-more/icons/icons/file.svg?raw";
import iconFolder from "./far-more/icons/icons/folder.svg?raw";
import iconHtml from "./far-more/icons/icons/html.svg?raw";
import iconImage from "./far-more/icons/icons/image.svg?raw";
import iconJson from "./far-more/icons/icons/json.svg?raw";
import iconMarkdown from "./far-more/icons/icons/markdown.svg?raw";
import iconPdf from "./far-more/icons/icons/pdf.svg?raw";
import iconVideo from "./far-more/icons/icons/video.svg?raw";
import iconsPackageJson from "./far-more/icons/package.json?raw";
import layout from "./far-more/layout.json5?raw";
import settings from "./far-more/settings.json5?raw";

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
  dir(fs, "far-more.app");
  file(fs, "far-more.app/README.md", "123456789");
  dir(fs, "far-more.app/Releases");
  dir(fs, "far-more.app/Releases/Windows");
  dir(fs, "far-more.app/Releases/Windows/Stable");
  file(fs, "far-more.app/Releases/Windows/Stable/far-more-1.0.exe", "123");
  dir(fs, "far-more.app/Releases/Mac OS");
  dir(fs, "far-more.app/Releases/Mac OS/Stable");
  file(fs, "far-more.app/Releases/Mac OS/Stable/far-more-1.0.pkg", "123");
  dir(fs, "far-more.app/Releases/Linux");
  dir(fs, "far-more.app/Releases/Linux/Stable");
  file(fs, "far-more.app/Releases/Linux/Stable/far-more-1.0.deb", "123");
  dir(fs, "far-more.app/News");
  file(fs, "far-more.app/News/2023-02-01.md", "123");
  dir(fs, "far-more.app/Many Files");
  createManyFiles(1000).forEach((fn) =>
    file(fs, "far-more.app/Many Files/" + fn, randomContent())
  );
  dir(fs, "far-more.app/UTF files");
  file(fs, "far-more.app/UTF files/🍣🍺", "🍣🍺");
  file(fs, "far-more.app/UTF files/中国人", "中国人");
  file(fs, "far-more.app/UTF files/יידיש", "יידיש");
  file(fs, "far-more.app/UTF files/Русский", "Русский");
  file(fs, "far-more.app/UTF files/Français", "Français");
  file(fs, "far-more.app/UTF files/عرب", "عرب");
  file(fs, "far-more.app/UTF files/แบบไทย", "แบบไทย");
  file(fs, "far-more.app/UTF files/asd\r\nfgh", "asd\r\nfgh");
  dir(fs, "far-more.app/UTF files/S\\p;e:c'i\"al dir");
  file(
    fs,
    "far-more.app/UTF files/S\\p;e:c'i\"al dir/back\\slash file",
    "back\\slash file"
  );
  return fs;
}

function randomContent(): string {
  const lineCount = (1 + Math.random() * 20) | 0;
  let content = randLine({ lineCount });
  return content;
}
