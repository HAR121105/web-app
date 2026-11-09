import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const { errorResponse } = await requireAuth("owner");
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const periode = searchParams.get("periode") || "bulan_ini";

    const now = new Date();
    let startDate: Date;

    if (periode === "hari_ini") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (periode === "minggu_ini") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Senin
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
    } else {
      // bulan_ini (default)
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    }

    // Ambil transaksi dalam periode
    const transaksiList = await prisma.transaksi.findMany({
      where: {
        waktu_transaksi: {
          gte: startDate,
        },
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
      orderBy: {
        waktu_transaksi: "desc",
      },
    });

    let totalOmzet = 0;
    let totalTransaksiBerhasil = 0;
    let countQRIS = 0;
    let countTunai = 0;

    const menuSalesMap = new Map<string, { nama: string; terjual: number; subtotal: number }>();

    for (const trx of transaksiList) {
      if (trx.status_pembayaran === "Berhasil") {
        totalOmzet += trx.total_transaksi;
        totalTransaksiBerhasil += 1;
        if (trx.metode_pembayaran === "QRIS") countQRIS += 1;
        if (trx.metode_pembayaran === "Tunai") countTunai += 1;

        for (const item of trx.pesanan.detail_pesanan) {
          const current = menuSalesMap.get(item.id_menu) || {
            nama: item.menu.nama_menu,
            terjual: 0,
            subtotal: 0,
          };
          current.terjual += item.jumlah_pesanan;
          current.subtotal += item.subtotal;
          menuSalesMap.set(item.id_menu, current);
        }
      }
    }

    const topMenu = Array.from(menuSalesMap.entries())
      .map(([id, val]) => ({ id_menu: id, ...val }))
      .sort((a, b) => b.terjual - a.terjual);

    // Ambil ulasan pelanggan terbaru
    const ulasanList = await prisma.ulasan.findMany({
      include: {
        pesanan: {
          include: {
            pelanggan: true,
          },
        },
      },
      orderBy: {
        id_ulasan: "desc",
      },
      take: 10,
    });

    const formattedUlasan = ulasanList.map((u) => ({
      id: u.id_ulasan,
      pesananId: u.id_pesanan,
      pelanggan: u.pesanan.pelanggan.nama,
      kritik: u.kritik_pelanggan || "-",
      saran: u.saran_pelanggan || "-",
    }));

    const formattedTransaksi = transaksiList.map((t) => {
      const itemsStr = t.pesanan.detail_pesanan
        .map((d) => `${d.jumlah_pesanan}x ${d.menu.nama_menu}`)
        .join(", ");

      const waktuFormatted = new Date(t.waktu_transaksi).toLocaleString("id-ID", {
        dateStyle: "short",
        timeStyle: "short",
      }) + " WIB";

      return {
        id: t.id_transaksi,
        pesananId: t.id_pesanan,
        pelanggan: t.pesanan.pelanggan.nama,
        kasir: t.kasir?.nama_kasir || "Kasir Toko",
        waktu: waktuFormatted,
        items: itemsStr || "-",
        total: t.total_transaksi,
        metode: t.metode_pembayaran,
        status: t.status_pembayaran,
      };
    });

    return NextResponse.json({
      laporan: {
        periode,
        totalOmzet,
        totalTransaksiBerhasil,
        rataRataTransaksi:
          totalTransaksiBerhasil > 0
            ? Math.round(totalOmzet / totalTransaksiBerhasil)
            : 0,
        countQRIS,
        countTunai,
        topMenu,
        transaksi: formattedTransaksi,
        ulasan: formattedUlasan,
      },
    });
  } catch (error) {
    console.error("GET /api/owner/laporan error:", error);
    return NextResponse.json(
      { error: "Gagal menyusun laporan owner." },
      { status: 500 }
    );
  }
}
