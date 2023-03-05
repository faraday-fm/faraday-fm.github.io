import { FarMore, FarMoreHost } from "@far-more/web-ui";
import { buildDemoFs, buildFarMoreFs } from "./services/fs";
import { WebFs } from "./services/WebFs";

const farMoreFs = buildFarMoreFs();
const demoFs = buildDemoFs();
demoFs.createDirectory("mount");

const host: FarMoreHost = {
  config: {
    isDesktop: () => false,
  },
  farMoreFs,
  rootFs: demoFs,
};

const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
};

const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
  const root = e.dataTransfer.items[0].webkitGetAsEntry();
  if (root && root.isDirectory) {
    e.preventDefault();
    e.stopPropagation();
    demoFs.mount("mount/" + root.name, new WebFs(root as FileSystemDirectoryEntry));
  }
};

function App() {
  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ width: "100%", height: "100%", display: "grid" }}
    >
      <FarMore host={host} />
    </div>
  );
}

export default App;
