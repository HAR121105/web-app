import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateId, withRetry } from "@/lib/id-generator";

// GET /api/kitchen/menu -> Ambil seluruh menu untuk manajemen kitchen
export async function GET() {
  const { errorResponse } = await requireAuth("kitchen");
  if (errorResponse) return errorResponse;

  try {
    const list = await prisma.menu.findMany({
      include: {
        persediaan: true,
      },
      orderBy: {
        id_menu: "asc",
      },
    });

    return NextResponse.json({ menus: list });
  } catch (error) {
    console.error("GET /api/kitchen/menu error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar menu." },
      { status: 500 }
    );
  }
}

// POST /api/kitchen/menu -> Tambah menu baru beserta baris persediaan terkait dalam 1 transaksi
export async function POST(request: Request) {
  const { errorResponse } = await requireAuth("kitchen");
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { nama_menu, kategori_menu, harga_satuan, stok_awal } = body;

    // 1. Validasi Nama Menu
    if (!nama_menu || typeof nama_menu !== "string" || !nama_menu.trim()) {
      return NextResponse.json(
        { error: "Nama menu wajib diisi." },
        { status: 400 }
      );
    }
    const cleanNama = nama_menu.trim();

    // 2. Validasi Kategori
    if (!kategori_menu || typeof kategori_menu !== "string" || !kategori_menu.trim()) {
      return NextResponse.json(
        { error: "Kategori menu wajib diisi." },
        { status: 400 }
      );
    }
    const cleanKategori = kategori_menu.trim();

    // 3. Validasi Harga Satuan (> 0 dan bilangan bulat)
    const hargaNum = Number(harga_satuan);
    if (!Number.isInteger(hargaNum) || hargaNum <= 0) {
      return NextResponse.json(
        { error: "Harga satuan harus berupa bilangan bulat positif lebih besar dari Rp 0." },
        { status: 400 }
      );
    }

    // 4. Validasi Stok Awal (>= 0 dan bilangan bulat)
    const stokNum = Number(stok_awal);
    if (!Number.isInteger(stokNum) || stokNum < 0) {
      return NextResponse.json(
        { error: "Stok awal harus berupa bilangan bulat lebih besar atau sama dengan 0." },
        { status: 400 }
      );
    }

    // 5. Validasi Keunikan Nama Menu (Case-Insensitive)
    const existing = await prisma.menu.findFirst({
      where: {
        nama_menu: {
          equals: cleanNama,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: `Menu dengan nama "${cleanNama}" sudah ada di database (ID: ${existing.id_menu}). Mohon gunakan nama varian donat lain.`,
        },
        { status: 400 }
      );
    }

    // 6. Jalankan Transaksi Atomik ($transaction): Buat Menu & Persediaan sekaligus
    const result = await withRetry(async () => {
      return await prisma.$transaction(async (tx) => {
        const idMenu = await generateId("MNU", tx);
        const idPersediaan = await generateId("PRSD", tx);

        const newMenu = await tx.menu.create({
          data: {
            id_menu: idMenu,
            nama_menu: cleanNama,
            kategori_menu: cleanKategori,
            harga_satuan: hargaNum,
            aktif: true,
          },
        });

        const newPersediaan = await tx.persediaan.create({
          data: {
            id_persediaan: idPersediaan,
            id_menu: idMenu,
            jumlah_persediaan: stokNum,
          },
        });

        return {
          menu: newMenu,
          persediaan: newPersediaan,
        };
      });
    });

    return NextResponse.json(
      {
        message: `Menu donat "${result.menu.nama_menu}" berhasil ditambahkan dengan stok awal ${result.persediaan.jumlah_persediaan} pcs.`,
        menu: result.menu,
        persediaan: result.persediaan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/kitchen/menu error:", error);
    return NextResponse.json(
      { error: "Gagal memproses penambahan menu baru." },
      { status: 500 }
    );
  }
}
