// Individueller Zoom pro Produktfoto in den Marktkacheln.
// Ausgemessen am weissen Rand jedes Bildes: so gross, dass nichts abgeschnitten wird.
const ZOOM: Record<string, number> = {
  "aepfel.jpg": 1.25,
  "eier-bio.jpg": 1.1,
  "joghurt-schoko.webp": 1.25,
  "kuerbis.webp": 1.1,
  "mandeln.jpg": 1.25,
  "mehl.jpg": 1.25,
  "milch.webp": 1.25,
  "oatly-hafer.webp": 1.25,
  "rosenkohl.png": 1.15,
  "salz.webp": 1.25,
  "spargel.webp": 1.1,
  "vanillezucker.webp": 1.08,
  "vollrahm.jpg": 1.25,
  "zimt-bio.webp": 1.25,
  "zimt-classic.webp": 1.25,
  "zitrone.webp": 1.25,
  "zucker.webp": 1.25,
  "zwetschge.jpg": 1.1,
  "zwetschgen-bio-ch.jpg": 1.1,
};

export function getBildZoom(url?: string): number {
  if (!url) return 1;
  const name = url.split("/").pop() ?? "";
  return ZOOM[name] ?? 1;
}
