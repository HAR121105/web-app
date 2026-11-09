import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      include: {
        persediaan: true,
      },
      orderBy: {
        id_menu: "asc",
      },
    });

    const formattedMenus = menus.map((m) => ({
      id_menu: m.id_menu,
      nama_menu: m.nama_menu,
      kategori_menu: m.kategori_menu,
      harga_satuan: m.harga_satuan,
      jumlah_persediaan: m.persediaan?.jumlah_persediaan ?? 0,
    }));

    return NextResponse.json({
      menus: formattedMenus,
    });
  } catch (error: unknown) {
    // Hindari log error koneksi saat Next.js pre-render build tanpa database aktif
    const err = error as { code?: string };
    if (err?.code !== "P1001") {
      console.error("GET /api/menu error:", error);
    }
    return NextResponse.json(
      { error: "Gagal mengambil daftar menu donat.", menus: [] },
      { status: 500 }
    );
  }
}
