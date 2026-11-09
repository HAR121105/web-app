import { prisma } from "./prisma";

export async function generateId(
  prefix: "PSN" | "TRX" | "ULS" | "PLG" | "PSD"
): Promise<string> {
  let existingIds: string[] = [];

  switch (prefix) {
    case "PSN": {
      const rows = await prisma.pesanan.findMany({ select: { id_pesanan: true } });
      existingIds = rows.map((r) => r.id_pesanan);
      break;
    }
    case "TRX": {
      const rows = await prisma.transaksi.findMany({ select: { id_transaksi: true } });
      existingIds = rows.map((r) => r.id_transaksi);
      break;
    }
    case "ULS": {
      const rows = await prisma.ulasan.findMany({ select: { id_ulasan: true } });
      existingIds = rows.map((r) => r.id_ulasan);
      break;
    }
    case "PLG": {
      const rows = await prisma.pelanggan.findMany({ select: { id_pelanggan: true } });
      existingIds = rows.map((r) => r.id_pelanggan);
      break;
    }
    case "PSD": {
      const rows = await prisma.persediaan.findMany({ select: { id_persediaan: true } });
      existingIds = rows.map((r) => r.id_persediaan);
      break;
    }
  }

  let maxNum = 0;
  const regex = new RegExp(`^${prefix}(\\d+)$`, "i");

  for (const id of existingIds) {
    const match = id.match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) {
        maxNum = num;
      }
    }
  }

  const nextNum = maxNum + 1;
  return `${prefix}${String(nextNum).padStart(3, "0")}`;
}
