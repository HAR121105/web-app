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
    const { status } = body;

    if (status !== "Siap Diambil") {
      return NextResponse.json(
        { error: "Status transisi yang diizinkan untuk Kitchen adalah 'Siap Diambil'." },
        { status: 400 }
      );
    }

    const pesanan = await prisma.pesanan.findUnique({
      where: { id_pesanan: id },
      include: {
        detail_pesanan: {
          include: {
            menu: {
              include: {
                persediaan: true,
              },
            },
          },
        },
      },
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
          error: `Pesanan hanya dapat diselesaikan ke 'Siap Diambil' jika sedang berstatus 'Diproses Kitchen' (status saat ini: ${pesanan.status_pesanan}).`,
        },
        { status: 400 }
      );
    }

    const now = new Date();

    // Jalankan pemotongan stok otomatis dan update status dalam prisma.$transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Kurangi persediaan untuk setiap donat yang dipesan
      for (const item of pesanan.detail_pesanan) {
        const persediaan = item.menu.persediaan;
        if (!persediaan) {
          throw new Error(
            `Data persediaan untuk menu "${item.menu.nama_menu}" tidak ditemukan.`
          );
        }

        if (persediaan.jumlah_persediaan < item.jumlah_pesanan) {
          throw new Error(
            `Stok persediaan untuk "${item.menu.nama_menu}" tidak mencukupi (sisa: ${persediaan.jumlah_persediaan}, dibutuhkan: ${item.jumlah_pesanan}).`
          );
        }

        await tx.persediaan.update({
          where: { id_persediaan: persediaan.id_persediaan },
          data: {
            jumlah_persediaan: {
              decrement: item.jumlah_pesanan,
            },
          },
        });
      }

      // 2. Ubah status pesanan menjadi Siap Diambil
      const updatedPesanan = await tx.pesanan.update({
        where: { id_pesanan: id },
        data: {
          status_pesanan: "Siap Diambil",
          id_kitchen: session.ref_id,
        },
      });

      // 3. Catat ke riwayat_status_pesanan
      await tx.riwayat_status_pesanan.create({
        data: {
          id_pesanan: id,
          status_pesanan: "Siap Diambil",
          waktu_update: now,
        },
      });

      return updatedPesanan;
    });

    return NextResponse.json({
      message: `Pesanan ${id} selesai dibuat dan siap diserahkan di kasir. Stok persediaan telah dipotong otomatis.`,
      pesanan: result,
    });
  } catch (error: unknown) {
    console.error("PATCH /api/pesanan/[id]/status error:", error);
    const msg = error instanceof Error ? error.message : "Gagal memperbarui status pesanan.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
