import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const { errorResponse } = await requireAuth("kitchen");
  if (errorResponse) return errorResponse;

  try {
    // Kitchen menangani pesanan yang pembayarannya telah valid dan belum selesai
    const antrean = await prisma.pesanan.findMany({
      where: {
        status_pesanan: {
          in: ["Diproses Kitchen", "Siap Diambil"],
        },
      },
      include: {
        pelanggan: true,
        detail_pesanan: {
          include: {
            menu: true,
          },
        },
        transaksi: true,
        kitchen: true,
      },
      orderBy: [
        { tanggal_pesanan: "asc" },
        { waktu_pesanan: "asc" },
      ],
    });

    return NextResponse.json({ antrean });
  } catch (error) {
    console.error("GET /api/kitchen/antrean error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil antrean masak kitchen." },
      { status: 500 }
    );
  }
}
