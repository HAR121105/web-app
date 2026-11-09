import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const { errorResponse } = await requireAuth("kasir", "owner");
  if (errorResponse) return errorResponse;

  try {
    const allTransaksi = await prisma.transaksi.findMany({
      include: {
        pesanan: true,
      },
    });

    let totalOmzet = 0;
    let totalTransaksiBerhasil = 0;
    let totalMenungguValidasi = 0;
    let countQRIS = 0;
    let countTunai = 0;

    for (const trx of allTransaksi) {
      if (trx.status_pembayaran === "Berhasil") {
        totalOmzet += trx.total_transaksi;
        totalTransaksiBerhasil += 1;
        if (trx.metode_pembayaran === "QRIS") countQRIS += 1;
        if (trx.metode_pembayaran === "Tunai") countTunai += 1;
      } else if (trx.status_pembayaran === "Menunggu Validasi") {
        totalMenungguValidasi += 1;
      }
    }

    const siapDiambilCount = await prisma.pesanan.count({
      where: { status_pesanan: "Siap Diambil" },
    });

    const selesaiCount = await prisma.pesanan.count({
      where: { status_pesanan: "Selesai" },
    });

    return NextResponse.json({
      rekap: {
        totalOmzet,
        totalTransaksiBerhasil,
        totalMenungguValidasi,
        countQRIS,
        countTunai,
        siapDiambilCount,
        selesaiCount,
        totalSeluruhTransaksi: allTransaksi.length,
      },
    });
  } catch (error) {
    console.error("GET /api/kasir/rekap error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data rekap kasir." },
      { status: 500 }
    );
  }
}
