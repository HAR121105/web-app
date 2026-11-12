import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// DELETE /api/kitchen/menu/[id] -> Soft delete menu (set aktif = false)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAuth("kitchen");
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;

    const existingMenu = await prisma.menu.findUnique({
      where: { id_menu: id },
      include: {
        detail_pesanan: {
          select: { id_pesanan: true },
          take: 1,
        },
      },
    });

    if (!existingMenu) {
      return NextResponse.json(
        { error: `Menu dengan ID "${id}" tidak ditemukan.` },
        { status: 404 }
      );
    }

    if (!existingMenu.aktif) {
      return NextResponse.json(
        { error: `Menu "${existingMenu.nama_menu}" sudah berstatus nonaktif sebelumnya.` },
        { status: 400 }
      );
    }

    // Lakukan SOFT DELETE (aktif: false)
    // Jangan hapus permanen agar integritas relasi foreign key pada detail_pesanan tetap terjaga
    const updatedMenu = await prisma.menu.update({
      where: { id_menu: id },
      data: {
        aktif: false,
      },
    });

    return NextResponse.json({
      message: `Menu "${updatedMenu.nama_menu}" (${updatedMenu.id_menu}) berhasil dinonaktifkan (soft delete). Menu ini tidak akan tampil lagi di katalog pemesanan pelanggan.`,
      menu: updatedMenu,
    });
  } catch (error) {
    console.error("DELETE /api/kitchen/menu/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus/menonaktifkan menu." },
      { status: 500 }
    );
  }
}

// PATCH /api/kitchen/menu/[id] -> Mengaktifkan kembali menu yang nonaktif
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAuth("kitchen");
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { aktif } = body;

    const targetMenu = await prisma.menu.findUnique({
      where: { id_menu: id },
    });

    if (!targetMenu) {
      return NextResponse.json(
        { error: `Menu dengan ID "${id}" tidak ditemukan.` },
        { status: 404 }
      );
    }

    const updatedMenu = await prisma.menu.update({
      where: { id_menu: id },
      data: {
        aktif: typeof aktif === "boolean" ? aktif : !targetMenu.aktif,
      },
    });

    return NextResponse.json({
      message: `Status menu "${updatedMenu.nama_menu}" berhasil diubah menjadi ${updatedMenu.aktif ? "Aktif" : "Nonaktif"}.`,
      menu: updatedMenu,
    });
  } catch (error) {
    console.error("PATCH /api/kitchen/menu/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status menu." },
      { status: 500 }
    );
  }
}
