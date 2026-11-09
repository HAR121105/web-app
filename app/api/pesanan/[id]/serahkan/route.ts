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

    const pesanan = await prisma.pesanan.findUnique({
      where: { id_pesanan: id },
    });

    if (!pesanan) {
      return NextResponse.json(
        { error: `Pesanan ${id} tidak ditemukan.` },
        { status: 404 }
      );
    }

    if (pesanan.status_pesanan !== "Siap Diambil") {
      return NextResponse.json(
        {
          error: `Pesanan tidak dapat diserahkan karena statusnya adalah '${pesanan.status_pesanan}'. Hanya pesanan dengan status 'Siap Diambil' yang dapat diserahkan.`,
        },
        { status: 400 }
      );
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const updatedPesanan = await tx.pesanan.update({
        where: { id_pesanan: id },
        data: {
          status_pesanan: "Selesai",
          waktu_selesai: now,
          id_kasir: session.ref_id,
        },
      });

      await tx.riwayat_status_pesanan.create({
        data: {
          id_pesanan: id,
          status_pesanan: "Selesai",
          waktu_update: now,
        },
      });

      return updatedPesanan;
    });

    return NextResponse.json({
      message: `Pesanan ${id} berhasil diserahkan ke pelanggan dan status berubah menjadi 'Selesai'.`,
      pesanan: result,
    });
  } catch (error) {
    console.error("PATCH /api/pesanan/[id]/serahkan error:", error);
    return NextResponse.json(
      { error: "Gagal menyerahkan pesanan." },
      { status: 500 }
    );
  }
}
