import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateId } from "@/lib/id-generator";

export async function GET() {
  const { session, errorResponse } = await requireAuth("pelanggan");
  if (errorResponse) return errorResponse;

  try {
    const pesanan = await prisma.pesanan.findMany({
      where: {
        id_pelanggan: session.ref_id,
      },
      include: {
        detail_pesanan: {
          include: {
            menu: true,
          },
        },
        transaksi: true,
        ulasan: true,
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
    console.error("GET /api/pesanan error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar pesanan." },
      { status: 500 }
    );
  }
}

interface OrderItemInput {
  id_menu: string;
  jumlah: number;
}

export async function POST(request: Request) {
  const { session, errorResponse } = await requireAuth("pelanggan");
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { metode_pembayaran, items, bukti_pembayaran } = body;

    if (!metode_pembayaran || !["QRIS", "Tunai"].includes(metode_pembayaran)) {
      return NextResponse.json(
        { error: "Metode pembayaran harus berupa 'QRIS' atau 'Tunai'." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Keranjang pesanan tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Validasi ukuran bukti pembayaran (maks 500 KB ~ 700.000 karakter Base64)
    if (bukti_pembayaran && typeof bukti_pembayaran === "string") {
      if (bukti_pembayaran.length > 700000) {
        return NextResponse.json(
          { error: "Ukuran bukti pembayaran terlalu besar (maksimal 500 KB)." },
          { status: 400 }
        );
      }
    }

    // Ambil data menu dan persediaan dari database untuk validasi harga & stok
    const menuIds = items.map((i: OrderItemInput) => i.id_menu);
    const dbMenus = await prisma.menu.findMany({
      where: { id_menu: { in: menuIds } },
      include: { persediaan: true },
    });

    const menuMap = new Map(dbMenus.map((m) => [m.id_menu, m]));

    let totalTransaksi = 0;
    const detailToCreate: {
      id_menu: string;
      jumlah_pesanan: number;
      harga_satuan: number;
      subtotal: number;
    }[] = [];

    for (const item of items as OrderItemInput[]) {
      const menu = menuMap.get(item.id_menu);
      if (!menu) {
        return NextResponse.json(
          { error: `Menu dengan ID ${item.id_menu} tidak ditemukan.` },
          { status: 400 }
        );
      }

      const jumlah = Number(item.jumlah);
      if (isNaN(jumlah) || jumlah <= 0) {
        return NextResponse.json(
          { error: `Jumlah pesanan untuk ${menu.nama_menu} tidak valid.` },
          { status: 400 }
        );
      }

      // Validasi ketersediaan stok
      const stokTersedia = menu.persediaan?.jumlah_persediaan ?? 0;
      if (jumlah > stokTersedia) {
        return NextResponse.json(
          {
            error: `Stok untuk "${menu.nama_menu}" tidak mencukupi. Tersedia: ${stokTersedia}, dipesan: ${jumlah}.`,
          },
          { status: 400 }
        );
      }

      const hargaSatuan = menu.harga_satuan;
      const subtotal = hargaSatuan * jumlah;
      totalTransaksi += subtotal;

      detailToCreate.push({
        id_menu: item.id_menu,
        jumlah_pesanan: jumlah,
        harga_satuan: hargaSatuan,
        subtotal,
      });
    }

    const newIdPesanan = await generateId("PSN");
    const newIdTransaksi = await generateId("TRX");
    const now = new Date();

    // Jalankan seluruh mutasi tabel dalam satu transaksi atomik
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat pesanan
      const pesanan = await tx.pesanan.create({
        data: {
          id_pesanan: newIdPesanan,
          id_pelanggan: session.ref_id,
          status_pesanan: "Menunggu Validasi",
          tanggal_pesanan: now,
          waktu_pesanan: now,
        },
      });

      // 2. Buat detail_pesanan
      await tx.detail_pesanan.createMany({
        data: detailToCreate.map((d) => ({
          id_pesanan: newIdPesanan,
          id_menu: d.id_menu,
          jumlah_pesanan: d.jumlah_pesanan,
          harga_satuan: d.harga_satuan,
          subtotal: d.subtotal,
        })),
      });

      // 3. Buat transaksi
      const transaksi = await tx.transaksi.create({
        data: {
          id_transaksi: newIdTransaksi,
          id_pesanan: newIdPesanan,
          total_transaksi: totalTransaksi,
          metode_pembayaran,
          status_pembayaran: "Menunggu Validasi",
          bukti_pembayaran: bukti_pembayaran || null,
          waktu_transaksi: now,
        },
      });

      // 4. Catat riwayat status pesanan
      await tx.riwayat_status_pesanan.create({
        data: {
          id_pesanan: newIdPesanan,
          status_pesanan: "Menunggu Validasi",
          waktu_update: now,
        },
      });

      return { pesanan, transaksi };
    });

    return NextResponse.json(
      {
        message: "Pesanan berhasil dibuat.",
        pesanan: result.pesanan,
        transaksi: result.transaksi,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/pesanan error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pembuatan pesanan." },
      { status: 500 }
    );
  }
}
