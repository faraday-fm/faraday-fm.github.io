import { FarMore, FarMoreHost } from "@far-more/web-ui";
import { buildDemoFs, buildFarMoreFs } from "./services/fs";

const farMoreFs = buildFarMoreFs();
const demoFs = buildDemoFs();

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
