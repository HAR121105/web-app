import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SessionRole, setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, role } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const akun = await prisma.akun.findUnique({
      where: { username: String(username).trim() },
      include: {
        pelanggan: true,
        kasir: true,
        kitchen: true,
        owner: true,
      },
    });

    if (!akun) {
      return NextResponse.json(
        { error: "Username atau password salah." },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(String(password), akun.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Username atau password salah." },
        { status: 401 }
      );
    }

    // Jika client memilih tab role di login page, pastikan role sesuai
    if (role && akun.role !== role) {
      return NextResponse.json(
        {
          error: `Akun ini terdaftar sebagai role '${akun.role}', bukan '${role}'. Silakan pilih tab role yang sesuai.`,
        },
        { status: 403 }
      );
    }

    let ref_id = "";
    let nama = akun.username;

    if (akun.role === "pelanggan" && akun.pelanggan) {
      ref_id = akun.pelanggan.id_pelanggan;
      nama = akun.pelanggan.nama;
    } else if (akun.role === "kasir" && akun.kasir) {
      ref_id = akun.kasir.id_kasir;
      nama = akun.kasir.nama_kasir;
    } else if (akun.role === "kitchen" && akun.kitchen) {
      ref_id = akun.kitchen.id_kitchen;
      nama = akun.kitchen.nama_kitchen;
    } else if (akun.role === "owner" && akun.owner) {
      ref_id = akun.owner.id_owner;
      nama = akun.owner.nama_owner;
    }

    await setSessionCookie({
      id_akun: akun.id_akun,
      username: akun.username,
      role: akun.role as SessionRole,
      ref_id,
      nama,
    });

    return NextResponse.json({
      message: "Login berhasil.",
      user: {
        id_akun: akun.id_akun,
        username: akun.username,
        role: akun.role,
        ref_id,
        nama,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server saat login." },
      { status: 500 }
    );
  }
}
