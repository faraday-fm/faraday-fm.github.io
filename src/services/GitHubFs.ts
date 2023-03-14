import {
  FileSystemProvider,
  FileSystemWatcher,
  FsEntry,
} from "@far-more/web-ui";

export class GitHubFs implements FileSystemProvider {
  constructor(private username: string, private repo: string) {}
  async watch(
    path: string,
    watcher: FileSystemWatcher,
    options?: { recursive?: boolean; excludes?: string[]; signal?: AbortSignal }
  ): Promise<void> {
    const result = await fetch(
      `https://api.github.com/repos/${this.username}/${this.repo}/contents/${path}`,
      { signal: options?.signal }
    );
    const json = await result.json();
    if (Array.isArray(json)) {
      watcher(
        json.map((entry) => ({
          entry,
          path: path + "/" + entry.name,
          type: "created",
        }))
      );
      watcher([{ type: "ready" }]);
    } else {
      watcher([
        {
          type: "created",
          entry: { name: json.name, isFile: true, size: json.size },
          path: json.path,
        },
      ]);
      watcher([{ type: "ready" }]);
    }
  }
  async readDirectory(
    path: string,
    options?: { signal?: AbortSignal }
  ): Promise<FsEntry[]> {
    const result = await fetch(
      `https://api.github.com/repos/${this.username}/${this.repo}/contents/${path}`,
      { signal: options?.signal }
    );
    const json = await result.json();
    return (
      (json as []).map?.((e: any) => ({
        name: e.name,
        isDir: e.type === "dir",
        isFile: e.type === "file",
      })) ?? []
    );
  }
  createDirectory(
    path: string,
    options?: { signal?: AbortSignal | undefined } | undefined
  ): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
  async readFile(
    path: string,
    options?: { signal?: AbortSignal | undefined } | undefined
  ): Promise<Uint8Array> {
    const result = await fetch(
      `https://raw.githubusercontent.com/${this.username}/${this.repo}/main/${path}`,
      { signal: options?.signal }
    );
    const buf = await result.arrayBuffer();
    return new Uint8Array(buf);
  }
  writeFile(
    path: string,
    content: Uint8Array,
    options?:
      | {
          create?: boolean | undefined;
          overwrite?: boolean | undefined;
          signal?: AbortSignal | undefined;
        }
      | undefined
  ): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
  delete(
    path: string,
    options?:
      | { recursive?: boolean | undefined; signal?: AbortSignal | undefined }
      | undefined
  ): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
  rename(
    oldPath: string,
    newPath: string,
    options?:
      | { overwrite?: boolean | undefined; signal?: AbortSignal | undefined }
      | undefined
  ): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
}
