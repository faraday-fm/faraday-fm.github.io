import { Faraday, FaradayHost } from "@frdy/web-ui";
import { buildFaradayFs } from "./services/fs";

const faradayFs = await buildFaradayFs();

const host: FaradayHost = {
  config: {
    isDesktop: () => false,
  },
  faradayFs,
  rootFs: faradayFs,
};

function App() {
  return (
    <div
      style={{ width: "100%", height: "100%", display: "grid" }}
    >
      <Faraday host={host} />
    </div>
  );
}

export default App;
