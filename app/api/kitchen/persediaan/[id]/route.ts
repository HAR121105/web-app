import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAuth("kitchen");
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    const { jumlah_persediaan } = body;

    const stok = Number(jumlah_persediaan);
    if (isNaN(stok) || stok < 0) {
      return NextResponse.json(
        { error: "Jumlah persediaan harus berupa angka lebih besar atau sama dengan 0." },
        { status: 400 }
      );
    }

    const persediaan = await prisma.persediaan.findFirst({
      where: {
        OR: [{ id_persediaan: id }, { id_menu: id }],
      },
      include: { menu: true },
    });

    if (!persediaan) {
      return NextResponse.json(
        { error: `Persediaan dengan ID/Menu ${id} tidak ditemukan.` },
        { status: 404 }
      );
    }

    const updated = await prisma.persediaan.update({
      where: { id_persediaan: persediaan.id_persediaan },
      data: {
        jumlah_persediaan: stok,
      },
      include: { menu: true },
    });

    return NextResponse.json({
      message: `Persediaan untuk "${updated.menu.nama_menu}" berhasil diperbarui menjadi ${updated.jumlah_persediaan} buah.`,
      persediaan: updated,
    });
  } catch (error) {
    console.error("PATCH /api/kitchen/persediaan/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui persediaan." },
      { status: 500 }
    );
  }
}
