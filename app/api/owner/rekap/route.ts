import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// DELETE /api/owner/rekap -> Menyembunyikan rekapan tertentu dari laporan Owner (Persisten)
// Sesuai aturan: INSERT ke tabel `rekap_dihapus`.
// Data operasional asli pada tabel `transaksi`, `pesanan`, dan `detail_pesanan` TIDAK BOLEH disentuh/dihapus.
export async function DELETE(request: Request) {
  const { session, errorResponse } = await requireAuth("owner");
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const id = body.id || searchParams.get("id");

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "ID transaksi (id) wajib disertakan." },
        { status: 400 }
      );
    }

    // Pastikan transaksi ada di database
    const trx = await prisma.transaksi.findUnique({
      where: { id_transaksi: id },
    });

    if (!trx) {
      return NextResponse.json(
        { error: `Transaksi dengan ID ${id} tidak ditemukan.` },
        { status: 404 }
      );
    }

    // INSERT ke rekap_dihapus (abaikan jika sudah ada; isi dihapus_oleh dari session)
    // Tidak boleh menyentuh transaksi, pesanan, atau detail_pesanan
    await prisma.rekap_dihapus.upsert({
      where: { id_transaksi: id },
      create: {
        id_transaksi: id,
        dihapus_oleh: session.username,
      },
      update: {
        dihapus_pada: new Date(),
        dihapus_oleh: session.username,
      },
    });

    return NextResponse.json({
      message: `Baris rekapan transaksi ${id} berhasil disembunyikan dari laporan. Data transaksi dan pesanan asli tetap aman dan utuh di database.`,
      deletedId: id,
    });
  } catch (error) {
    console.error("DELETE /api/owner/rekap error:", error);
    return NextResponse.json(
      { error: "Gagal memproses penghapusan rekapan." },
      { status: 500 }
    );
  }
}
