import { createInMemoryFs, FarMore, FarMoreHost } from "@far-more/web-ui";
import { buildDemoFs, buildFarMoreFs } from "./services/fs";

const farMoreFs = createInMemoryFs();
const demoFs = createInMemoryFs();
buildFarMoreFs(farMoreFs);
buildDemoFs(demoFs);

const host: FarMoreHost = {
  config: {
    isDesktop: () => false,
  },
  farMoreFs,
  rootFs: demoFs
};

function App() {
  return <FarMore host={host} />;
}

export default App;
