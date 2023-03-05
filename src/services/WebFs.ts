import {
  FileSystemProvider,
  FileSystemWatcher,
  FsEntry,
} from "@far-more/web-ui";

export class WebFs implements FileSystemProvider {
  private root: FileSystemDirectoryEntry;

  constructor(root: FileSystemDirectoryEntry) {
    this.root = root;
  }
  async watch(
    path: string,
    watcher: FileSystemWatcher,
    options?:
      | {
          recursive?: boolean | undefined;
          excludes?: string[] | undefined;
          signal?: AbortSignal | undefined;
        }
      | undefined
  ): Promise<void> {
    const entries = await this.readDirectory(path);
    entries.forEach((e) =>
      watcher([{ type: "created", path: path + "/" + e.name, entry: e }])
    );
  }
  readDirectory(
    path: string,
    options?: { signal?: AbortSignal | undefined } | undefined
  ): FsEntry[] | Promise<FsEntry[]> {
    let resolve: (val: FsEntry[]) => void;
    let reject: (reason?: any) => void;
    const result = new Promise<FsEntry[]>((res, rej) => {
      (resolve = res), (reject = rej);
    });
    const listDir = (dir: FileSystemEntry) => {
      if (dir.isDirectory) {
        (dir as FileSystemDirectoryEntry).createReader().readEntries(
          (entries) =>
            resolve(
              entries.map((e) => ({
                name: e.name,
                isFile: e.isFile,
                isDir: e.isDirectory,
              }))
            ),
          (error) => reject(error)
        );
      }
    };

    if (path === "") {
      listDir(this.root);
    }
    this.root.getDirectory(
      "/" + this.root.name + "/" + path,
      undefined,
      (success) => listDir(success),
      (error) => reject(error)
    );
    return result;
  }
  createDirectory(
    path: string,
    options?: { signal?: AbortSignal | undefined } | undefined
  ): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
  readFile(
    path: string,
    options?: { signal?: AbortSignal | undefined } | undefined
  ): Promise<Uint8Array> {
    let resolve: (val: Uint8Array) => void;
    let reject: (reason?: any) => void;
    const result = new Promise<Uint8Array>((res, rej) => {
      (resolve = res), (reject = rej);
    });

    this.root.getFile(
      "/" + this.root.name + "/" + path,
      undefined,
      (fileEntry) => {
        (fileEntry as FileSystemFileEntry).file(
          (file) => file.arrayBuffer().then((ab) => resolve(new Uint8Array(ab))),
          (error) => reject(error)
        );
      },
      (error) => reject(error)
    );
    return result;
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
  copy?(
    source: string,
    destination: string,
    options?:
      | { overwrite?: boolean | undefined; signal?: AbortSignal | undefined }
      | undefined
  ): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
  mount?(path: string, fs: FileSystemProvider): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
}
