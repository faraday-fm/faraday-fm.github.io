export function init() {
  const root = document.createElement("div");
  root.id = "root";
  root.style.position = "relative";
  document.body.appendChild(root);
}

let url;

export function updateContent(content, path) {
  const root = document.getElementById("root");
  const img = document.createElement("img");

  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "contain";
  img.style.position = "absolute";
  img.style.top = "50%";
  img.style.left = "50%";
  img.style.transform = "translate(-50%, -50%)";

  const ext = path.split(".").at(-1);
  let mime = "";
  switch (ext) {
    case "png":
      mime = "image/png";
      break;
    case "jpg":
    case "jpeg":
      mime = "image/jpeg";
      break;
    case "svg":
      mime = "image/svg+xml";
      break;
  }
  URL.revokeObjectURL(url);
  url = URL.createObjectURL((new Blob([content.buffer], { type: mime })));
  img.src = url;
  img.onload = () => {
    root.innerHTML = "";
    root.appendChild(img);
  };
}
