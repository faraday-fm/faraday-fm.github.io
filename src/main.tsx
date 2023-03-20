import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./index.css";

registerSW({ immediate: true });

// replaced dyanmicaly
const date = "__DATE__";

console.info("Built at: " + date);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
