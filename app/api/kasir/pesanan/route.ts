import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const { errorResponse } = await requireAuth("kasir");
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status && status !== "Semua") {
      where.status_pesanan = status;
    }

    const pesanan = await prisma.pesanan.findMany({
      where,
      include: {
        pelanggan: true,
        detail_pesanan: {
          include: {
            menu: true,
          },
        },
        transaksi: true,
        riwayat_status_pesanan: {
          orderBy: { waktu_update: "asc" },
        },
      },
      orderBy: [
        { tanggal_pesanan: "desc" },
        { waktu_pesanan: "desc" },
      ],
    });

    return NextResponse.json({ pesanan });
  } catch (error) {
    console.error("GET /api/kasir/pesanan error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar pesanan kasir." },
      { status: 500 }
    );
  }
}
