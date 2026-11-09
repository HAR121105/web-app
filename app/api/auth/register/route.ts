import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      username,
      password,
      nama,
      email,
      no_telepon,
      alamat,
      tanggal_lahir,
      kode_pos,
    } = body;

    if (!username || !password || !nama) {
      return NextResponse.json(
        { error: "Username, password, dan nama lengkap wajib diisi." },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim();
    const cleanNama = String(nama).trim();

    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: "Username minimal 3 karakter." },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter." },
        { status: 400 }
      );
    }

    // Cek username unik
    const existingAkun = await prisma.akun.findUnique({
      where: { username: cleanUsername },
    });
    if (existingAkun) {
      return NextResponse.json(
        { error: "Username sudah digunakan, silakan pilih username lain." },
        { status: 400 }
      );
    }

    // Cek email unik jika diisi
    if (email) {
      const cleanEmail = String(email).trim();
      const existingEmail = await prisma.pelanggan.findUnique({
        where: { email: cleanEmail },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: "Email sudah terdaftar, silakan gunakan email lain." },
          { status: 400 }
        );
      }
    }

    // Generate custom ID PLG###
    const allPelanggan = await prisma.pelanggan.findMany({
      select: { id_pelanggan: true },
    });

    let nextNumber = 1;
    for (const p of allPelanggan) {
      const match = p.id_pelanggan.match(/^PLG(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num >= nextNumber) {
          nextNumber = num + 1;
        }
      }
    }
    const newIdPelanggan = `PLG${String(nextNumber).padStart(3, "0")}`;

    // Hash password bcrypt salt 10
    const password_hash = await bcrypt.hash(String(password), 10);

    const parsedTglLahir = tanggal_lahir ? new Date(tanggal_lahir) : null;

    // Transaksi pembuatan akun dan pelanggan
    const result = await prisma.$transaction(async (tx) => {
      const newAkun = await tx.akun.create({
        data: {
          username: cleanUsername,
          password_hash,
          role: "pelanggan",
        },
      });

      const newPelanggan = await tx.pelanggan.create({
        data: {
          id_pelanggan: newIdPelanggan,
          id_akun: newAkun.id_akun,
          nama: cleanNama,
          email: email ? String(email).trim() : null,
          no_telepon: no_telepon ? String(no_telepon).trim() : null,
          alamat: alamat ? String(alamat).trim() : null,
          tanggal_lahir: parsedTglLahir,
          kode_pos: kode_pos ? String(kode_pos).trim() : null,
        },
      });

      return { akun: newAkun, pelanggan: newPelanggan };
    });

    // Otomatis buat sesi cookie setelah registrasi sukses
    await setSessionCookie({
      id_akun: result.akun.id_akun,
      username: result.akun.username,
      role: "pelanggan",
      ref_id: result.pelanggan.id_pelanggan,
      nama: result.pelanggan.nama,
    });

    return NextResponse.json(
      {
        message: "Registrasi pelanggan berhasil.",
        user: {
          id_akun: result.akun.id_akun,
          username: result.akun.username,
          role: "pelanggan",
          ref_id: result.pelanggan.id_pelanggan,
          nama: result.pelanggan.nama,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Gagal memproses registrasi akun." },
      { status: 500 }
    );
  }
}
