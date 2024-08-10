var g = 1048576;
function u(t, a, e) {
  let r, i = 0;
  return new ReadableStream({
    async start() {
      r = await t.open(a, 1, 2, void 0, { signal: e });
    },
    async pull(n) {
      try {
        const c = await t.read(r, i, g, { signal: e });
        i += g, c.byteLength > 0 ? n.enqueue(c) : n.close();
      } catch {
        n.close();
      }
    },
    async cancel() {
      t.close(r);
    }
  });
}
async function m(t) {
  const a = t.getReader(), e = [];
  let r = 0;
  for (; ; ) {
    const { done: n, value: c } = await a.read();
    if (n)
      break;
    c && (e.push(c), r += c.length);
  }
  const i = new Uint8Array(r);
  let o = 0;
  for (const n of e)
    i.set(n, o), o += n.length;
  return i;
}
async function d(t, a) {
  const e = u(faraday.fs, t, a == null ? void 0 : a.signal);
  return m(e);
}
const s = document.getElementById("root");
function y(t) {
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
const f = async (t) => {
  const a = await d(t), e = document.createElement("img");
  e.style.width = "100%", e.style.height = "100%", e.style.objectFit = "contain", e.style.position = "absolute", e.style.top = "50%", e.style.left = "50%", e.style.transform = "translate(-50%, -50%)", l = URL.createObjectURL(new Blob([a.buffer], { type: y(t) })), e.src = l, e.onload = () => {
    s.innerHTML = "", s.appendChild(e);
  }, e.onerror = () => {
    s.innerHTML = "Cannot load the image.";
  };
};
function p() {
  console.info("Image Viewer Activated"), faraday.events.on("activefilechange", f), faraday.activefile && f(faraday.activefile);
}
function v() {
  console.info("Image Viewer Deactivated"), faraday.events.off("activefilechange", f), s.innerHTML = "", URL.revokeObjectURL(l);
}
export {
  p as activate,
  v as deactivate
};
