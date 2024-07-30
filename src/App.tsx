import { Faraday, FaradayHost } from "@frdy/web-ui";
import { buildDemoFs, buildFaradayFs } from "./services/fs";
import { GitHubFs } from "./services/GitHubFs";
import { WebFs } from "./services/WebFs";

const faradayFs = await buildFaradayFs();
const demoFs = await buildDemoFs();
demoFs.createDirectory("mount");
demoFs.mount("github", new GitHubFs("faraday-fm", "web-ui"));

faradayFs.mount('demo', demoFs);

const host: FaradayHost = {
  config: {
    isDesktop: () => false,
  },
  faradayFs,
  rootFs: faradayFs,
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
    demoFs.mount(
      "mount/" + root.name,
      new WebFs(root as FileSystemDirectoryEntry)
    );
  }
};

function App() {
  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ width: "100%", height: "100%", display: "grid" }}
    >
      <Faraday host={host} />
    </div>
  );
}

export default App;
