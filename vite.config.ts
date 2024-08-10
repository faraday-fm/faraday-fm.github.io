import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { zipFolderPlugin } from "./scripts/zipFolderPlugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), zipFolderPlugin()],
  build: {
    target: "esnext",
    chunkSizeWarningLimit: 5000,
  },
});
