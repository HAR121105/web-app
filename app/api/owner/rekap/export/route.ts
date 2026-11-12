import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { formatCsv } from "@/lib/csv";

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
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
    } else {
      // bulan_ini (default)
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    }

    // Ambil daftar rekap_dihapus untuk mengecualikan transaksi yang disembunyikan
    const rekapDihapusList = await prisma.rekap_dihapus.findMany({
      select: { id_transaksi: true },
    });
    const deletedTrxIds = new Set(rekapDihapusList.map((d) => d.id_transaksi));

    // Ambil data transaksi sesuai periode
    const rawTransaksiList = await prisma.transaksi.findMany({
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

    // Kecualikan transaksi yang ada di rekap_dihapus
    const transaksiList = rawTransaksiList.filter((t) => !deletedTrxIds.has(t.id_transaksi));

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

    const rataRata = totalTransaksiBerhasil > 0 ? Math.round(totalOmzet / totalTransaksiBerhasil) : 0;
    const tanggalCetak = now.toISOString().slice(0, 10);

    // Susun baris-baris CSV
    const csvRows: (string | number | null | undefined)[][] = [];

    // Header Laporan
    csvRows.push(["REKAPITULASI PENJUALAN TOKO DONAT HABIL"]);
    csvRows.push(["Periode Laporan", periode.replace("_", " ").toUpperCase()]);
    csvRows.push(["Tanggal Unduh", `${tanggalCetak} ${now.toLocaleTimeString("id-ID")}`]);
    csvRows.push([]); // baris kosong

    // Ringkasan Eksekutif
    csvRows.push(["RINGKASAN KINERJA"]);
    csvRows.push(["Indikator", "Nilai"]);
    csvRows.push(["Total Pendapatan (Omzet)", `Rp ${totalOmzet.toLocaleString("id-ID")}`]);
    csvRows.push(["Total Transaksi Berhasil", totalTransaksiBerhasil]);
    csvRows.push(["Rata-rata Nilai Transaksi", `Rp ${rataRata.toLocaleString("id-ID")}`]);
    csvRows.push(["Pembayaran QRIS", `${countQRIS} transaksi`]);
    csvRows.push(["Pembayaran Tunai", `${countTunai} transaksi`]);
    csvRows.push([]); // baris kosong

    // Donat Terlaris
    csvRows.push(["PERINGKAT DONAT TERLARIS"]);
    csvRows.push(["Peringkat", "ID Menu", "Nama Menu", "Jumlah Terjual (pcs)", "Total Omzet (Rp)"]);
    if (topMenu.length === 0) {
      csvRows.push(["-", "-", "Belum ada penjualan", 0, 0]);
    } else {
      topMenu.forEach((m, idx) => {
        csvRows.push([idx + 1, m.id_menu, m.nama, m.terjual, m.subtotal]);
      });
    }
    csvRows.push([]); // baris kosong

    // Rincian Transaksi
    csvRows.push(["RINCIAN TRANSAKSI PENJUALAN"]);
    csvRows.push([
      "No",
      "ID Transaksi",
      "No Pesanan",
      "Waktu Transaksi",
      "Nama Pelanggan",
      "Petugas Kasir",
      "Rincian Menu Donat",
      "Metode Pembayaran",
      "Total Transaksi (Rp)",
      "Status Pembayaran",
    ]);

    if (transaksiList.length === 0) {
      csvRows.push(["-", "-", "-", "-", "-", "-", "Tidak ada transaksi pada periode ini", "-", 0, "-"]);
    } else {
      transaksiList.forEach((t, idx) => {
        const itemsDesc = t.pesanan.detail_pesanan
          .map((d) => `${d.jumlah_pesanan}x ${d.menu.nama_menu}`)
          .join("; ");

        const waktuStr = new Date(t.waktu_transaksi).toLocaleString("id-ID", {
          dateStyle: "short",
          timeStyle: "short",
        });

        csvRows.push([
          idx + 1,
          t.id_transaksi,
          t.id_pesanan,
          waktuStr,
          t.pesanan.pelanggan.nama,
          t.kasir?.nama_kasir || "Kasir Toko",
          itemsDesc || "-",
          t.metode_pembayaran,
          t.total_transaksi,
          t.status_pembayaran,
        ]);
      });
    }

    const csvContent = formatCsv(csvRows);
    const filename = `rekap-${tanggalCetak}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/owner/rekap/export error:", error);
    return NextResponse.json(
      { error: "Gagal mengekspor rekapan sebagai CSV." },
      { status: 500 }
    );
  }
}
