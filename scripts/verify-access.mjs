/**
 * scripts/verify-access.mjs
 * Skrip verifikasi permission matrix dan otorisasi role Toko Donat Habil.
 * Menguji algoritma HMAC-SHA256 session token dan aturan hak akses multi-role (RBAC).
 */

const SESSION_SECRET =
  process.env.SESSION_SECRET || "donat-habil-default-secret-key-modul-4-lsik-2026-unand";

async function getCryptoKey() {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function createToken(payload) {
  const key = await getCryptoKey();
  const exp = Math.floor(Date.now() / 1000) + 28800;
  const fullPayload = { ...payload, exp };
  const enc = new TextEncoder();
  const dataB64 = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(dataB64));
  const sigB64 = Buffer.from(signature).toString("base64url");
  return `${dataB64}.${sigB64}`;
}

async function verifyToken(token) {
  if (!token || !token.includes(".")) return null;
  try {
    const [dataB64, sigB64] = token.split(".");
    const key = await getCryptoKey();
    const enc = new TextEncoder();
    const sigBuffer = Buffer.from(sigB64, "base64url");
    const valid = await crypto.subtle.verify("HMAC", key, sigBuffer, enc.encode(dataB64));
    if (!valid) return null;
    const payload = JSON.parse(Buffer.from(dataB64, "base64url").toString("utf-8"));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function checkAccess(sessionRole, allowedRoles) {
  if (!sessionRole) return 401;
  if (!allowedRoles.includes(sessionRole)) return 403;
  return 200;
}

async function main() {
  console.log("=================================================");
  console.log("  UJI OTORISASI & PERMISSION MATRIX TOKO DONAT HABIL");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name}`);
      failed++;
    }
  }

  // 1. Uji Pembuatan & Validasi Token
  console.log("1. Pengujian Kriptografi Session Token HMAC-SHA256:");
  const tokenPelanggan = await createToken({
    id_akun: 1,
    username: "adzra",
    role: "pelanggan",
    ref_id: "PLG001",
    nama: "Adzra",
  });
  assert(typeof tokenPelanggan === "string" && tokenPelanggan.includes("."), "Pembuatan token session berhasil");

  const verified = await verifyToken(tokenPelanggan);
  assert(verified !== null && verified.role === "pelanggan", "Verifikasi token valid mengembalikan role 'pelanggan'");

  // 2. Uji Penolakan Token Manipulasi
  console.log("\n2. Pengujian Penolakan Token Rusak & Kedaluwarsa:");
  const tamperedToken = tokenPelanggan.slice(0, -6) + "xxxxxx";
  const verifiedTampered = await verifyToken(tamperedToken);
  assert(verifiedTampered === null, "Token yang dimanipulasi ditolak (HMAC-SHA256 signature mismatch)");

  const emptyToken = await verifyToken("");
  assert(emptyToken === null, "Token kosong ditolak (null)");

  // 3. Matriks Otorisasi Endpoint (RBAC)
  console.log("\n3. Pengujian Matriks Akses Multi-Role:");

  // Endpoint: /api/pesanan (Hanya Pelanggan)
  assert(checkAccess("pelanggan", ["pelanggan"]) === 200, "Pelanggan diizinkan checkout pesanan (200)");
  assert(checkAccess("kasir", ["pelanggan"]) === 403, "Kasir DITOLAK checkout pesanan (403)");
  assert(checkAccess("kitchen", ["pelanggan"]) === 403, "Kitchen DITOLAK checkout pesanan (403)");
  assert(checkAccess("owner", ["pelanggan"]) === 403, "Owner DITOLAK checkout pesanan (403)");
  assert(checkAccess(null, ["pelanggan"]) === 401, "Pengunjung tanpa login DITOLAK checkout pesanan (401)");

  // Endpoint: /api/kasir/pesanan (Hanya Kasir)
  assert(checkAccess("kasir", ["kasir"]) === 200, "Kasir diizinkan akses antrean validasi (200)");
  assert(checkAccess("pelanggan", ["kasir"]) === 403, "Pelanggan DITOLAK akses panel kasir (403)");
  assert(checkAccess("kitchen", ["kasir"]) === 403, "Kitchen DITOLAK akses panel kasir (403)");
  assert(checkAccess(null, ["kasir"]) === 401, "Pengunjung tanpa login DITOLAK akses panel kasir (401)");

  // Endpoint: /api/kitchen/antrean (Hanya Kitchen)
  assert(checkAccess("kitchen", ["kitchen"]) === 200, "Kitchen diizinkan akses antrean masak dapur (200)");
  assert(checkAccess("pelanggan", ["kitchen"]) === 403, "Pelanggan DITOLAK akses antrean dapur (403)");
  assert(checkAccess("kasir", ["kitchen"]) === 403, "Kasir DITOLAK akses antrean dapur (403)");
  assert(checkAccess(null, ["kitchen"]) === 401, "Pengunjung tanpa login DITOLAK akses antrean dapur (401)");

  // Endpoint: /api/owner/laporan (Hanya Owner)
  assert(checkAccess("owner", ["owner"]) === 200, "Owner diizinkan akses laporan omzet toko (200)");
  assert(checkAccess("pelanggan", ["owner"]) === 403, "Pelanggan DITOLAK akses laporan keuangan (403)");
  assert(checkAccess("kasir", ["owner"]) === 403, "Kasir DITOLAK akses laporan keuangan (403)");
  assert(checkAccess("kitchen", ["owner"]) === 403, "Kitchen DITOLAK akses laporan keuangan (403)");
  assert(checkAccess(null, ["owner"]) === 401, "Pengunjung tanpa login DITOLAK akses laporan keuangan (401)");

  console.log("\n=================================================");
  console.log(`HASIL AKHIR: ${passed} LULUS, ${failed} GAGAL`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Gagal menjalankan skrip uji:", err);
  process.exit(1);
});
