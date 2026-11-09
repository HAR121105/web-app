import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireAuth("kasir");
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    const { aksi } = body;

    if (!aksi || !["valid", "tidak_valid"].includes(aksi)) {
      return NextResponse.json(
        { error: "Aksi tidak valid. Gunakan 'valid' atau 'tidak_valid'." },
        { status: 400 }
      );
    }

    const transaksi = await prisma.transaksi.findFirst({
      where: {
        OR: [{ id_transaksi: id }, { id_pesanan: id }],
      },
      include: {
        pesanan: true,
      },
    });

    if (!transaksi) {
      return NextResponse.json(
        { error: `Transaksi dengan ID/Pesanan ${id} tidak ditemukan.` },
        { status: 404 }
      );
    }

    // Hanya boleh divalidasi jika status pembayaran dan status pesanan adalah "Menunggu Validasi"
    if (
      transaksi.status_pembayaran !== "Menunggu Validasi" ||
      transaksi.pesanan.status_pesanan !== "Menunggu Validasi"
    ) {
      return NextResponse.json(
        {
          error: `Transaksi tidak dapat divalidasi ulang karena sudah diproses sebelumnya (Status pembayaran: '${transaksi.status_pembayaran}', status pesanan: '${transaksi.pesanan.status_pesanan}').`,
        },
        { status: 409 }
      );
    }

    const targetStatusBayar = aksi === "valid" ? "Berhasil" : "Tidak Valid";
    const targetStatusPesanan =
      aksi === "valid" ? "Diproses Kitchen" : "Pembayaran Tidak Valid";

    const result = await prisma.$transaction(async (tx) => {
      // Pengecekan dan update atomik: pastikan kondisi belum berubah oleh request lain
      const updateTrxResult = await tx.transaksi.updateMany({
        where: {
          id_transaksi: transaksi.id_transaksi,
          status_pembayaran: "Menunggu Validasi",
        },
        data: {
          status_pembayaran: targetStatusBayar,
          id_kasir: session.ref_id,
        },
      });

      if (updateTrxResult.count === 0) {
        throw new Error("CONFLICT_ALREADY_PROCESSED");
      }

      const updatePsnResult = await tx.pesanan.updateMany({
        where: {
          id_pesanan: transaksi.id_pesanan,
          status_pesanan: "Menunggu Validasi",
        },
        data: {
          status_pesanan: targetStatusPesanan,
          id_kasir: session.ref_id,
        },
      });

      if (updatePsnResult.count === 0) {
        throw new Error("CONFLICT_ALREADY_PROCESSED");
      }

      await tx.riwayat_status_pesanan.create({
        data: {
          id_pesanan: transaksi.id_pesanan,
          status_pesanan: targetStatusPesanan,
          waktu_update: new Date(),
        },
      });

      const updatedTransaksi = await tx.transaksi.findUnique({
        where: { id_transaksi: transaksi.id_transaksi },
      });
      const updatedPesanan = await tx.pesanan.findUnique({
        where: { id_pesanan: transaksi.id_pesanan },
      });

      return { updatedTransaksi, updatedPesanan };
    });

    return NextResponse.json({
      message:
        aksi === "valid"
          ? "Pembayaran dinyatakan VALID. Pesanan diteruskan ke antrean Kitchen."
          : "Pembayaran dinyatakan TIDAK VALID.",
      transaksi: result.updatedTransaksi,
      pesanan: result.updatedPesanan,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "CONFLICT_ALREADY_PROCESSED") {
      return NextResponse.json(
        {
          error: "Transaksi ini telah diproses oleh kasir lain atau statusnya telah berubah.",
        },
        { status: 409 }
      );
    }
    console.error("PATCH /api/transaksi/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal memproses validasi pembayaran." },
      { status: 500 }
    );
  }
}
