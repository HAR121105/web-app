import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const { errorResponse } = await requireAuth("kitchen");
  if (errorResponse) return errorResponse;

  try {
    const list = await prisma.persediaan.findMany({
      include: {
        menu: true,
      },
      orderBy: {
        id_persediaan: "asc",
      },
    });

    const formatted = list.map((p) => ({
      id_persediaan: p.id_persediaan,
      id_menu: p.id_menu,
      nama_menu: p.menu.nama_menu,
      kategori_menu: p.menu.kategori_menu,
      harga_satuan: p.menu.harga_satuan,
      jumlah_persediaan: p.jumlah_persediaan,
      aktif: p.menu.aktif,
    }));

    return NextResponse.json({ persediaan: formatted });
  } catch (error) {
    console.error("GET /api/kitchen/persediaan error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar persediaan donat." },
      { status: 500 }
    );
  }
}
