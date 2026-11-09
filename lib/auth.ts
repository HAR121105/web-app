import { NextResponse } from "next/server";
import { getSession, SessionRole, SessionUser } from "./session";

export type AuthResult =
  | { session: SessionUser; errorResponse: null }
  | { session: null; errorResponse: NextResponse };

export async function requireAuth(...allowedRoles: SessionRole[]): Promise<AuthResult> {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "Sesi tidak ditemukan atau telah kedaluwarsa. Silakan login kembali." },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        {
          error: `Akses ditolak. Endpoint ini memerlukan role: ${allowedRoles.join(
            ", "
          )}, sedangkan role Anda: ${session.role}.`,
        },
        { status: 403 }
      ),
    };
  }

  return { session, errorResponse: null };
}
