import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateId, withRetry } from "@/lib/id-generator";

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

interface RawOrderItemInput {
  id_menu?: unknown;
  jumlah?: unknown;
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

    // Validasi bukti pembayaran
    let verifiedBukti: string | null = null;
    if (metode_pembayaran === "QRIS") {
      if (!bukti_pembayaran || typeof bukti_pembayaran !== "string") {
        return NextResponse.json(
          { error: "Bukti pembayaran QRIS wajib diunggah." },
          { status: 400 }
        );
      }

      const match = bukti_pembayaran.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
      if (!match) {
        return NextResponse.json(
          {
            error:
              "Format bukti pembayaran tidak valid (harus berupa data URL gambar PNG atau JPEG).",
          },
          { status: 400 }
        );
      }

      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, "base64");
      if (buffer.length === 0) {
        return NextResponse.json(
          { error: "Bukti pembayaran tidak boleh kosong." },
          { status: 400 }
        );
      }

      if (buffer.length > 500 * 1024) {
        return NextResponse.json(
          { error: "Ukuran bukti pembayaran terlalu besar (maksimal 500 KB)." },
          { status: 400 }
        );
      }

      verifiedBukti = bukti_pembayaran;
    } else {
      // Tunai: bukti diabaikan/ditolak (simpan null)
      verifiedBukti = null;
    }

    // Validasi & hardening items: gabungkan duplikat id_menu, validasi bilangan bulat 1..99
    const mergedMap = new Map<string, number>();

    for (const rawItem of items as RawOrderItemInput[]) {
      if (!rawItem || typeof rawItem.id_menu !== "string" || !rawItem.id_menu.trim()) {
        return NextResponse.json(
          { error: "ID menu tidak valid pada salah satu item pesanan." },
          { status: 400 }
        );
      }

      const idMenu = rawItem.id_menu.trim();
      const qtyNum = Number(rawItem.jumlah);

      if (!Number.isInteger(qtyNum) || qtyNum < 1 || qtyNum > 99) {
        return NextResponse.json(
          {
            error: `Jumlah pesanan harus bilangan bulat antara 1 dan 99 (item: ${idMenu}).`,
          },
          { status: 400 }
        );
      }

      const current = mergedMap.get(idMenu) ?? 0;
      const nextTotal = current + qtyNum;
      if (nextTotal > 99) {
        return NextResponse.json(
          {
            error: `Total jumlah pesanan untuk menu ${idMenu} melebihi batas maksimal (99 buah).`,
          },
          { status: 400 }
        );
      }
      mergedMap.set(idMenu, nextTotal);
    }

    if (mergedMap.size === 0) {
      return NextResponse.json(
        { error: "Daftar pesanan tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Ambil data menu dan persediaan dari database untuk validasi harga & stok
    const menuIds = Array.from(mergedMap.keys());
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

    for (const [idMenu, jumlah] of mergedMap.entries()) {
      const menu = menuMap.get(idMenu);
      if (!menu) {
        return NextResponse.json(
          { error: `Menu dengan ID ${idMenu} tidak ditemukan.` },
          { status: 400 }
        );
      }

      if (!menu.aktif) {
        return NextResponse.json(
          {
            error: `Menu "${menu.nama_menu}" saat ini sedang tidak aktif dan tidak dapat dipesan.`,
          },
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
        id_menu: idMenu,
        jumlah_pesanan: jumlah,
        harga_satuan: hargaSatuan,
        subtotal,
      });
    }

    // Jalankan seluruh mutasi tabel dalam transaksi atomik dengan generateId di dalam tx dan retry P2002
    const result = await withRetry(async () => {
      return await prisma.$transaction(async (tx) => {
        const newIdPesanan = await generateId("PSN", tx);
        const newIdTransaksi = await generateId("TRX", tx);
        const now = new Date();

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
            bukti_pembayaran: verifiedBukti,
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
