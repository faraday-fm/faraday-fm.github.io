import {
  FileSystemProvider,
  FileSystemWatcher,
  FsEntry,
} from "@frdy/web-ui";

export class WebFs implements FileSystemProvider {
  private root: FileSystemDirectoryEntry;

  constructor(root: FileSystemDirectoryEntry) {
    this.root = root;
  }
  async watchDir(
    path: string,
    watcher: FileSystemWatcher,
    options?: {
      recursive?: boolean;
      excludes?: string[];
      signal?: AbortSignal;
    }
  ): Promise<void> {
    const entries = await this.readDirectory(path);
    options?.signal?.throwIfAborted();
    entries.forEach((e) =>
      watcher([{ type: "created", path: path + "/" + e.name, entry: e }])
    );
  }
  async watchFile(
    path: string,
    watcher: FileSystemWatcher,
    options?: {
      recursive?: boolean;
      excludes?: string[];
      signal?: AbortSignal;
    }
  ): Promise<void> {
    const entries = await this.readDirectory(path);
    options?.signal?.throwIfAborted();
    entries.forEach((e) =>
      watcher([{ type: "created", path: path + "/" + e.name, entry: e }])
    );
  }
  readDirectory(
    path: string,
    options?: { signal?: AbortSignal }
  ): Promise<FsEntry[]> {
    let resolve: (val: FsEntry[]) => void;
    let reject: (reason?: any) => void;
    const result = new Promise<FsEntry[]>((res, rej) => {
      (resolve = res), (reject = rej);
    });
    const listDir = (dir: FileSystemEntry) => {
      if (dir.isDirectory) {
        (dir as FileSystemDirectoryEntry).createReader().readEntries(
          (entries) => {
            if (options?.signal?.aborted) {
              reject(options.signal.reason);
            }
            resolve(
              entries.map((e) => ({
                name: e.name,
                isFile: e.isFile,
                isDir: e.isDirectory,
              }))
            );
          },
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
      (success) => {
        if (options?.signal?.aborted) {
          reject(options.signal.reason);
        }
        listDir(success);
      },
      (error) => reject(error)
    );
    return result;
  }
  createDirectory(
    path: string,
    options?: { signal?: AbortSignal }
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  readFile(
    path: string,
    options?: { signal?: AbortSignal }
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
          async (file) => {
            try {
              options?.signal?.throwIfAborted();
              const buffer = await file.arrayBuffer();
              options?.signal?.throwIfAborted();
              resolve(new Uint8Array(buffer));
            } catch (err) {
              reject(err);
            }
          },
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
    options?: {
      create?: boolean;
      overwrite?: boolean;
      signal?: AbortSignal;
    }
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  delete(
    path: string,
    options?: { recursive?: boolean; signal?: AbortSignal }
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  rename(
    oldPath: string,
    newPath: string,
    options?: { overwrite?: boolean; signal?: AbortSignal }
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  copy(
    source: string,
    destination: string,
    options?: { overwrite?: boolean; signal?: AbortSignal }
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  mount(path: string, fs: FileSystemProvider): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
