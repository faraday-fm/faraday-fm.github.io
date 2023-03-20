import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// replaced dyanmicaly
const date = "__DATE__";

console.info("Built at: " + date);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
