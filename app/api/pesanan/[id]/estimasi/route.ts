import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireAuth("kitchen");
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    const { estimasi_menit } = body;

    const menit = Number(estimasi_menit);
    if (isNaN(menit) || menit <= 0 || menit > 180) {
      return NextResponse.json(
        { error: "Estimasi waktu harus antara 1 sampai 180 menit." },
        { status: 400 }
      );
    }

    const pesanan = await prisma.pesanan.findUnique({
      where: { id_pesanan: id },
    });

    if (!pesanan) {
      return NextResponse.json(
        { error: `Pesanan ${id} tidak ditemukan.` },
        { status: 404 }
      );
    }

    if (pesanan.status_pesanan !== "Diproses Kitchen") {
      return NextResponse.json(
        {
          error: `Estimasi waktu hanya dapat diisi jika pesanan sedang berstatus 'Diproses Kitchen' (status saat ini: ${pesanan.status_pesanan}).`,
        },
        { status: 400 }
      );
    }

    const estimasiDate = new Date(Date.now() + menit * 60 * 1000);

    const updatedPesanan = await prisma.pesanan.update({
      where: { id_pesanan: id },
      data: {
        estimasi_selesai: estimasiDate,
        id_kitchen: session.ref_id,
      },
    });

    return NextResponse.json({
      message: `Estimasi waktu selesai untuk pesanan ${id} berhasil disimpan (${menit} menit).`,
      pesanan: updatedPesanan,
    });
  } catch (error) {
    console.error("PATCH /api/pesanan/[id]/estimasi error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan estimasi waktu kitchen." },
      { status: 500 }
    );
  }
}
