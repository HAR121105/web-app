import { prisma } from "./prisma";

// Type db as PrismaClient or TransactionClient
type DbClient = typeof prisma | Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function generateId(
  prefix: "PSN" | "TRX" | "ULS" | "PLG" | "PSD",
  db: DbClient = prisma
): Promise<string> {
  let existingIds: string[] = [];

  switch (prefix) {
    case "PSN": {
      const rows = await db.pesanan.findMany({ select: { id_pesanan: true } });
      existingIds = rows.map((r: { id_pesanan: string }) => r.id_pesanan);
      break;
    }
    case "TRX": {
      const rows = await db.transaksi.findMany({ select: { id_transaksi: true } });
      existingIds = rows.map((r: { id_transaksi: string }) => r.id_transaksi);
      break;
    }
    case "ULS": {
      const rows = await db.ulasan.findMany({ select: { id_ulasan: true } });
      existingIds = rows.map((r: { id_ulasan: string }) => r.id_ulasan);
      break;
    }
    case "PLG": {
      const rows = await db.pelanggan.findMany({ select: { id_pelanggan: true } });
      existingIds = rows.map((r: { id_pelanggan: string }) => r.id_pelanggan);
      break;
    }
    case "PSD": {
      const rows = await db.persediaan.findMany({ select: { id_persediaan: true } });
      existingIds = rows.map((r: { id_persediaan: string }) => r.id_persediaan);
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

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: unknown) {
      attempt++;
      const isP2002 =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "P2002";

      if (isP2002 && attempt < maxRetries) {
        continue;
      }
      throw error;
    }
  }
}

