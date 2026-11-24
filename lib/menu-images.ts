/**
 * lib/menu-images.ts
 * Peta gambar dan deskripsi menu donat Toko Donat Habil.
 */

export const MENU_IMAGES: Record<string, string> = {
  MNU001: "/images/donat/donat-gula-halus.jpeg",
  MNU002: "/images/donat/donat-cokelat-meses.jpeg",
  MNU003: "/images/donat/donat-keju.jpeg",
  MNU004: "/images/donat/donat-tiramisu.jpeg",
  MNU005: "/images/donat/donat-matcha.jpeg",
  MNU006: "/images/donat/donat-red-velvet.jpeg",
  MNU007: "/images/donat/choco-oreo.jpeg",
  MNU008: "/images/donat/cokelat-keju.jpeg",
  MNU009: "/images/donat/nut-and-choco.jpeg",
};

export const MENU_DESCRIPTIONS: Record<string, string> = {
  MNU001: "Donat kentang tradisional dengan taburan gula halus salju premium yang manis lembut.",
  MNU002: "Balutan cokelat tebal nikmat bertabur butiran meses cokelat manis melimpah.",
  MNU003: "Donat empuk gurih dengan parutan keju cheddar melimpah dan krim manis spesial.",
  MNU004: "Glaze krim tiramisu Italia dengan aroma kopi susu lembut bertabur bubuk kakao murni.",
  MNU005: "Celupan glaze teh hijau matcha Jepang asli dengan sensasi manis legit menyegarkan.",
  MNU006: "Donat merah velvet mewah berpadu crumble red velvet renyah dan krim vanila lembut.",
  MNU007: "Kombinasi lumeran cokelat pekat dengan remahan biskuit Oreo hitam gurih renyah.",
  MNU008: "Perpaduan klasik terbaik antara lelehan cokelat manis dan taburan parutan keju gurih.",
  MNU009: "Glaze cokelat lezat berlimpah topping kacang sangrai renyah dengan aroma gurih khas.",
};

export function getDonutImage(idMenu?: string, namaMenu?: string): string {
  if (idMenu && MENU_IMAGES[idMenu]) {
    return MENU_IMAGES[idMenu];
  }

  if (namaMenu) {
    const n = namaMenu.toLowerCase();
    if (n.includes("gula") || n.includes("halus")) return "/images/donat/donat-gula-halus.jpeg";
    if (n.includes("meses")) return "/images/donat/donat-cokelat-meses.jpeg";
    if (n.includes("keju") && !n.includes("cokelat") && !n.includes("choco")) return "/images/donat/donat-keju.jpeg";
    if (n.includes("tiramisu")) return "/images/donat/donat-tiramisu.jpeg";
    if (n.includes("matcha") || n.includes("green tea")) return "/images/donat/donat-matcha.jpeg";
    if (n.includes("red velvet") || n.includes("velvet")) return "/images/donat/donat-red-velvet.jpeg";
    if (n.includes("oreo")) return "/images/donat/choco-oreo.jpeg";
    if ((n.includes("cokelat") || n.includes("choco")) && (n.includes("keju") || n.includes("chessy") || n.includes("cheese"))) {
      return "/images/donat/cokelat-keju.jpeg";
    }
    if (n.includes("nut") || n.includes("kacang")) return "/images/donat/nut-and-choco.jpeg";
    if (n.includes("cokelat") || n.includes("choco")) return "/images/donat/donat-cokelat-meses.jpeg";
  }

  return "/images/donat/donat-gula-halus.jpeg";
}

export function getDonutDesc(idMenu?: string, namaMenu?: string, kategori?: string): string {
  if (idMenu && MENU_DESCRIPTIONS[idMenu]) {
    return MENU_DESCRIPTIONS[idMenu];
  }
  return `Donat lezat ${namaMenu || "spesial"} kategori ${kategori || "Favorit"} dibuat hangat dengan bahan premium berkualitas.`;
}
