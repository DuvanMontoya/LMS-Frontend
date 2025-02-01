export function getImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `https://backend.laila.icu/api/${path}`; // Ajusta esto según tu configuración
}
