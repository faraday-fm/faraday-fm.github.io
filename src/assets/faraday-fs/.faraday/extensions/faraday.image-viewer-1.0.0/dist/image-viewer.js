var d = 1048576;
function f(t, n, e) {
  let a, c = 0;
  return new ReadableStream({
    async start() {
      a = await t.open(n, 1, 2, void 0, { signal: e });
    },
    async pull(r) {
      try {
        const i = await t.read(a, c, d, { signal: e });
        c += d, i.byteLength > 0 ? r.enqueue(i) : r.close();
      } catch {
        r.close();
      }
    },
    async cancel() {
      t.close(a);
    }
  });
}
async function u(t) {
  const n = t.getReader(), e = [];
  let a = 0;
  for (; ; ) {
    const { done: r, value: i } = await n.read();
    if (r)
      break;
    i && (e.push(i), a += i.length);
  }
  const c = new Uint8Array(a);
  let o = 0;
  for (const r of e)
    c.set(r, o), o += r.length;
  return c;
}
async function p(t, n) {
  const e = f(faraday.fs, t, n == null ? void 0 : n.signal);
  return u(e);
}
const s = document.getElementById("root");
function m(t) {
  switch (t.split(".").at(-1)) {
    case "apng":
      return "image/apng";
    case "avif":
      return "image/avif";
    case "gif":
      return "image/gif";
    case "jpg":
    case "jpeg":
    case "jfif":
    case "pjpeg":
    case "pjp":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "svg":
      return "image/svg+xml";
    case "webp":
      return "image/webp";
    case "bmp":
      return "image/bmp";
    case "ico":
      return "image/x-icon";
    default:
      return;
  }
}
let l;
const g = async (t) => {
  const n = await p(t), e = document.createElement("img");
  e.style.width = "100%", e.style.height = "100%", e.style.objectFit = "contain", e.style.position = "absolute", e.style.top = "50%", e.style.left = "50%", e.style.transform = "translate(-50%, -50%)";
  const a = `color-mix(in srgb, transparent, ${faraday.theme.colors["panel.foreground"]} 5%)`;
  e.style.backgroundImage = `linear-gradient(45deg, ${a} 25%, transparent 25%), linear-gradient(-45deg, ${a} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${a} 75%), linear-gradient(-45deg, transparent 75%, ${a} 75%)`, e.style.backgroundSize = "20px 20px", e.style.backgroundPosition = "0 0, 0 10px, 10px -10px, -10px 0px", l = URL.createObjectURL(new Blob([n.buffer], { type: m(t) })), e.src = l, e.onload = () => {
    s.innerHTML = "", s.appendChild(e);
  }, e.onerror = () => {
    s.innerHTML = "Cannot load the image.";
  };
};
function y() {
  console.info("Image Viewer Activated"), faraday.events.on("activefilechange", g), faraday.activefile && g(faraday.activefile);
}
function v() {
  console.info("Image Viewer Deactivated"), faraday.events.off("activefilechange", g), s.innerHTML = "", URL.revokeObjectURL(l);
}
export {
  y as activate,
  v as deactivate
};
