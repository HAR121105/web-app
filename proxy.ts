import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let session = null;
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    session = await verifySessionToken(token);
  } catch {
    // Fail-closed: jika env SESSION_SECRET tidak ada atau verifikasi error, anggap tidak login
    session = null;
  }

  // Daftar rute terproteksi beserta role yang berhak
  const protectedRoutes: { prefix: string; role: string }[] = [
    { prefix: "/pelanggan", role: "pelanggan" },
    { prefix: "/kasir", role: "kasir" },
    { prefix: "/kitchen", role: "kitchen" },
    { prefix: "/owner", role: "owner" },
  ];

  for (const route of protectedRoutes) {
    if (pathname.startsWith(route.prefix)) {
      if (!session) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (session.role !== route.role) {
        // Jika sudah login tapi role tidak sesuai rute, redirect ke dashboard role aslinya
        const roleDashboardUrl = new URL(`/${session.role}`, request.url);
        return NextResponse.redirect(roleDashboardUrl);
      }
    }
  }

  // Jika sudah login dan mengakses halaman /login atau /register, redirect ke dashboard masing-masing
  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL(`/${session.role}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/pelanggan/:path*",
    "/kasir/:path*",
    "/kitchen/:path*",
    "/owner/:path*",
    "/login",
    "/register",
  ],
};
