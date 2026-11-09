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

    const targetStatusBayar = aksi === "valid" ? "Berhasil" : "Tidak Valid";
    const targetStatusPesanan =
      aksi === "valid" ? "Diproses Kitchen" : "Pembayaran Tidak Valid";

    const result = await prisma.$transaction(async (tx) => {
      const updatedTransaksi = await tx.transaksi.update({
        where: { id_transaksi: transaksi.id_transaksi },
        data: {
          status_pembayaran: targetStatusBayar,
          id_kasir: session.ref_id,
        },
      });

      const updatedPesanan = await tx.pesanan.update({
        where: { id_pesanan: transaksi.id_pesanan },
        data: {
          status_pesanan: targetStatusPesanan,
          id_kasir: session.ref_id,
        },
      });

      await tx.riwayat_status_pesanan.create({
        data: {
          id_pesanan: transaksi.id_pesanan,
          status_pesanan: targetStatusPesanan,
          waktu_update: new Date(),
        },
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
  } catch (error) {
    console.error("PATCH /api/transaksi/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal memproses validasi pembayaran." },
      { status: 500 }
    );
  }
}
