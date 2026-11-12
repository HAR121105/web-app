import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// POST /api/owner/rekap/pulihkan -> Memulihkan baris rekapan yang sebelumnya disembunyikan
// Menghapus baris dari tabel `rekap_dihapus` berdasarkan `id_transaksi`
// Hanya role Owner yang diizinkan (403 untuk selain Owner, 401 jika belum login)
export async function POST(request: Request) {
  const { errorResponse } = await requireAuth("owner");
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const id = body.id || searchParams.get("id");

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "ID transaksi (id) wajib disertakan untuk pemulihan." },
        { status: 400 }
      );
    }

    // Hapus baris dari rekap_dihapus berdasarkan id_transaksi
    const deleteResult = await prisma.rekap_dihapus.deleteMany({
      where: { id_transaksi: id },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json(
        { error: `Transaksi ${id} tidak ditemukan dalam daftar rekapan terhapus.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Baris rekapan transaksi ${id} berhasil dipulihkan ke laporan.`,
      restoredId: id,
    });
  } catch (error) {
    console.error("POST /api/owner/rekap/pulihkan error:", error);
    return NextResponse.json(
      { error: "Gagal memulihkan baris rekapan." },
      { status: 500 }
    );
  }
}
