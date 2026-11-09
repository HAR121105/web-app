import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateId, withRetry } from "@/lib/id-generator";

export async function POST(request: Request) {
  const { session, errorResponse } = await requireAuth("pelanggan");
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { id_pesanan, kritik_pelanggan, saran_pelanggan } = body;

    if (!id_pesanan) {
      return NextResponse.json(
        { error: "ID pesanan wajib disertakan." },
        { status: 400 }
      );
    }

    if (!kritik_pelanggan && !saran_pelanggan) {
      return NextResponse.json(
        { error: "Mohon isi setidaknya kritik atau saran untuk toko kami." },
        { status: 400 }
      );
    }

    const pesanan = await prisma.pesanan.findUnique({
      where: { id_pesanan },
      include: { ulasan: true },
    });

    if (!pesanan) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    if (pesanan.id_pelanggan !== session.ref_id) {
      return NextResponse.json(
        { error: "Anda tidak berhak memberikan ulasan untuk pesanan ini." },
        { status: 403 }
      );
    }

    if (pesanan.status_pesanan !== "Selesai") {
      return NextResponse.json(
        { error: "Ulasan hanya dapat diberikan jika pesanan telah berstatus 'Selesai'." },
        { status: 400 }
      );
    }

    if (pesanan.ulasan) {
      return NextResponse.json(
        { error: "Ulasan untuk pesanan ini sudah pernah dikirimkan sebelumnya." },
        { status: 400 }
      );
    }

    const ulasan = await withRetry(async () => {
      return await prisma.$transaction(async (tx) => {
        const newIdUlasan = await generateId("ULS", tx);

        return await tx.ulasan.create({
          data: {
            id_ulasan: newIdUlasan,
            id_pesanan,
            kritik_pelanggan: kritik_pelanggan ? String(kritik_pelanggan).trim() : null,
            saran_pelanggan: saran_pelanggan ? String(saran_pelanggan).trim() : null,
          },
        });
      });
    });

    return NextResponse.json(
      {
        message: "Ulasan berhasil dikirim. Terima kasih atas masukan Anda!",
        ulasan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/ulasan error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim ulasan pesanan." },
      { status: 500 }
    );
  }
}
