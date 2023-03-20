/// <reference types="vite/client" />

declare module "*?zip" {
  const value: Promise<ArrayBuffer>;
  export default value;
}
