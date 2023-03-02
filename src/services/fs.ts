import { FileSystemProvider, InMemoryFsProvider } from "@far-more/web-ui";
import { faker } from "@faker-js/faker";
import layout from "./far-more/layout.json5?raw";
import settings from "./far-more/settings.json5?raw";

const encoder = new TextEncoder();

function createManyFiles(count: number) {
  const result: string[] = [];
  const filenames = new Set<string>();
  while (filenames.size < count) {
    const fn = faker.system.commonFileName();
    if (!filenames.has(fn)) {
      filenames.add(fn);
      result.push(fn);
    }
  }
  return result;
}

function dir(fs: FileSystemProvider, name: string) {
  fs.createDirectory("far-more:" + name);
}

function file(fs: FileSystemProvider, name: string, content: string) {
  fs.writeFile("far-more:" + name, encoder.encode(content), {
    create: true,
    overwrite: false,
  });
}

export function buildFarMoreFs() {
  const fs = new InMemoryFsProvider();
  file(fs, "/layout.json", layout);
  file(fs, "/settings.json", settings);
  return fs;
}

export function buildDemoFs() {
  const fs = new InMemoryFsProvider();
  dir(fs, "/far-more.app");
  file(fs, "/far-more.app/README.md", "123456789");
  dir(fs, "/far-more.app/Releases");
  dir(fs, "/far-more.app/Releases/Windows");
  dir(fs, "/far-more.app/Releases/Windows/Stable");
  file(fs, "/far-more.app/Releases/Windows/Stable/far-more-1.0.exe", "123");
  dir(fs, "/far-more.app/Releases/Mac OS");
  dir(fs, "/far-more.app/Releases/Mac OS/Stable");
  file(fs, "/far-more.app/Releases/Mac OS/Stable/far-more-1.0.pkg", "123");
  dir(fs, "/far-more.app/Releases/Linux");
  dir(fs, "/far-more.app/Releases/Linux/Stable");
  file(fs, "/far-more.app/Releases/Linux/Stable/far-more-1.0.deb", "123");
  dir(fs, "/far-more.app/News");
  file(fs, "/far-more.app/News/2023-02-01.md", "123");
  dir(fs, "/far-more.app/Many Files");
  createManyFiles(1000).forEach((fn) =>
    file(fs, "/far-more.app/Many Files/" + fn, randomContent())
  );
  dir(fs, "/far-more.app/UTF files");
  file(fs, "/far-more.app/UTF files/🍣🍺", "🍣🍺");
  file(fs, "/far-more.app/UTF files/中国人", "中国人");
  file(fs, "/far-more.app/UTF files/יידיש", "יידיש");
  file(fs, "/far-more.app/UTF files/Русский", "Русский");
  file(fs, "/far-more.app/UTF files/Français", "Français");
  file(fs, "/far-more.app/UTF files/عرب", "عرب");
  file(fs, "/far-more.app/UTF files/แบบไทย", "แบบไทย");
  file(fs, "/far-more.app/UTF files/asd\nfgh", "asd\nfgh");
  file(fs, "/far-more.app/UTF files/asd\\fgh", "asd\\fgh");
  return fs;
}

function randomContent(): string {
  const lines = (1 + Math.random() * 20) | 0;
  let content = faker.lorem.lines(lines);
  return content;
}
