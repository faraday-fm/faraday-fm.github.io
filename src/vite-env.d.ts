/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module "*?zip" {
  const value: Promise<ArrayBuffer>;
  export default value;
}
