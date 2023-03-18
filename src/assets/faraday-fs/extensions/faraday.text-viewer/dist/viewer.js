function blobToBase64(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export function init() {
  const root = document.createElement('div');
  root.id = "root";
  root.style.display = "grid";
  root.style.positio = "relative";
  document.body.appendChild(root);
}

export function updateContent({content, path}) {
  const root = document.getElementById("root");

  root.innerText = content ? new TextDecoder().decode(content.buffer) : "";
}
