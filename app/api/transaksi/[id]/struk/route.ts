import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireAuth("kasir", "pelanggan", "owner");
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;

    const transaksi = await prisma.transaksi.findFirst({
      where: {
        OR: [{ id_transaksi: id }, { id_pesanan: id }],
      },
      include: {
        kasir: true,
        pesanan: {
          include: {
            pelanggan: true,
            detail_pesanan: {
              include: {
                menu: true,
              },
            },
          },
        },
      },
    });

    if (!transaksi) {
      return NextResponse.json(
        { error: `Transaksi ${id} tidak ditemukan.` },
        { status: 404 }
      );
    }

    // Jika pelanggan, pastikan hanya mengakses struk pesanan miliknya
    if (
      session.role === "pelanggan" &&
      transaksi.pesanan.id_pelanggan !== session.ref_id
    ) {
      return NextResponse.json(
        { error: "Anda tidak berhak melihat struk pesanan ini." },
        { status: 403 }
      );
    }

    const strukData = {
      toko: "TOKO DONAT HABIL",
      alamat: "Jl. Melati No. 12, Padang, Sumatera Barat",
      kontak: "+62 812-3456-7890",
      id_transaksi: transaksi.id_transaksi,
      id_pesanan: transaksi.id_pesanan,
      waktu_transaksi: transaksi.waktu_transaksi,
      kasir: transaksi.kasir?.nama_kasir || "Kasir Toko",
      pelanggan: transaksi.pesanan.pelanggan.nama,
      metode_pembayaran: transaksi.metode_pembayaran,
      status_pembayaran: transaksi.status_pembayaran,
      total_transaksi: transaksi.total_transaksi,
      items: transaksi.pesanan.detail_pesanan.map((d) => ({
        nama: d.menu.nama_menu,
        qty: d.jumlah_pesanan,
        harga: d.harga_satuan,
        subtotal: d.subtotal,
      })),
    };

    return NextResponse.json({ struk: strukData });
  } catch (error) {
    console.error("GET /api/transaksi/[id]/struk error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data cetak struk." },
      { status: 500 }
    );
  }
}
