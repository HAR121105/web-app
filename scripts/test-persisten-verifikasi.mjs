/**
 * scripts/test-persisten-verifikasi.mjs
 * Pengujian otomatis end-to-end fitur penghapusan rekapan Owner yang persisten,
 * verifikasi audit database 3NF, ekspor CSV, dan RBAC 403.
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
import { execSync } from "child_process";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3001";
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  throw new Error("SESSION_SECRET minimal 32 karakter harus terkonfigurasi di .env.local");
}

async function createToken(payload) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const exp = Math.floor(Date.now() / 1000) + 3600;
  const fullPayload = { ...payload, exp };
  const dataB64 = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(dataB64));
  const sigB64 = Buffer.from(signature).toString("base64url");
  return `donat_session=${dataB64}.${sigB64}`;
}

async function request(path, { method = "GET", cookie = null, body = null } = {}) {
  const headers = {};
  if (cookie) headers["Cookie"] = cookie;
  if (body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else if (contentType.includes("text/csv") || contentType.includes("text/")) {
    data = await res.text();
  }

  return { status: res.status, data };
}

async function run() {
  console.log("======================================================================");
  console.log("  VERIFIKASI PENGHAPUSAN REKAPAN OWNER SECARA PERSISTEN (HTTP NYATA)");
  console.log("======================================================================\n");

  const ownerCookie = await createToken({
    id_akun: 9,
    username: "owner",
    role: "owner",
    ref_id: "OWN001",
    nama: "Habil",
  });

  const kasirCookie = await createToken({
    id_akun: 5,
    username: "aidil",
    role: "kasir",
    ref_id: "KSR001",
    nama: "Aidil",
  });

  const kitchenCookie = await createToken({
    id_akun: 7,
    username: "daniel",
    role: "kitchen",
    ref_id: "KTN001",
    nama: "Daniel",
  });

  const pelangganCookie = await createToken({
    id_akun: 1,
    username: "adzra",
    role: "pelanggan",
    ref_id: "PLG001",
    nama: "Adzra",
  });

  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = "") {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name} -> ${details}`);
      failed++;
    }
  }

  // 1. Uji RBAC: Non-owner harus ditolak 403 / 401
  console.log("1. UJI PERMISSION MATRIX & KEAMANAN RBAC:");
  const rKasir = await request("/api/owner/rekap", { method: "DELETE", cookie: kasirCookie, body: { id: "TRX001" } });
  assert("Kasir DELETE /api/owner/rekap ditolak 403", rKasir.status === 403, `Status: ${rKasir.status}`);

  const rKitchen = await request("/api/owner/rekap", { method: "DELETE", cookie: kitchenCookie, body: { id: "TRX001" } });
  assert("Kitchen DELETE /api/owner/rekap ditolak 403", rKitchen.status === 403, `Status: ${rKitchen.status}`);

  const rPelanggan = await request("/api/owner/rekap", { method: "DELETE", cookie: pelangganCookie, body: { id: "TRX001" } });
  assert("Pelanggan DELETE /api/owner/rekap ditolak 403", rPelanggan.status === 403, `Status: ${rPelanggan.status}`);

  const rNoAuth = await request("/api/owner/rekap", { method: "DELETE", body: { id: "TRX001" } });
  assert("Guest (tanpa login) DELETE /api/owner/rekap ditolak 401", rNoAuth.status === 401, `Status: ${rNoAuth.status}`);

  const rKasirPulihkan = await request("/api/owner/rekap/pulihkan", { method: "POST", cookie: kasirCookie, body: { id: "TRX001" } });
  assert("Kasir POST /api/owner/rekap/pulihkan ditolak 403", rKasirPulihkan.status === 403, `Status: ${rKasirPulihkan.status}`);

  // 2. Data Awal Owner
  console.log("\n2. KONDISI AWAL LAPORAN OWNER:");
  const initialRes = await request("/api/owner/laporan?periode=bulan_ini", { cookie: ownerCookie });
  assert("Owner GET /api/owner/laporan berhasil 200", initialRes.status === 200, `Status: ${initialRes.status}`);
  const initialOmzet = initialRes.data?.laporan?.totalOmzet || 0;
  const initialTrxList = initialRes.data?.laporan?.transaksi || [];
  console.log(`     Total Omzet Awal: Rp ${initialOmzet.toLocaleString("id-ID")}`);
  console.log(`     Jumlah Transaksi Tampil: ${initialTrxList.length}`);
  const targetTrx = initialTrxList.find((t) => t.id === "TRX001");
  assert("TRX001 ada dalam laporan awal", !!targetTrx, "TRX001 tidak ditemukan");

  // 3. Eksekusi Hapus Rekapan (TRX001)
  console.log("\n3. EKSEKUSI HAPUS REKAPAN (TRX001):");
  const delRes = await request("/api/owner/rekap", {
    method: "DELETE",
    cookie: ownerCookie,
    body: { id: "TRX001" },
  });
  assert("Owner DELETE /api/owner/rekap TRX001 berhasil 200", delRes.status === 200, `Status: ${delRes.status}`);

  // 4. Verifikasi Persistensi setelah Refresh & Re-login
  console.log("\n4. VERIFIKASI PERSISTENSI SETELAH REFRESH & RE-LOGIN:");
  const freshOwnerCookie = await createToken({
    id_akun: 9,
    username: "owner",
    role: "owner",
    ref_id: "OWN001",
    nama: "Habil",
  });
  const afterDelRes = await request("/api/owner/laporan?periode=bulan_ini", { cookie: freshOwnerCookie });
  const afterOmzet = afterDelRes.data?.laporan?.totalOmzet || 0;
  const afterTrxList = afterDelRes.data?.laporan?.transaksi || [];
  const trx001Present = afterTrxList.some((t) => t.id === "TRX001");

  assert("TRX001 TIDAK muncul setelah refresh/re-login", !trx001Present, "TRX001 masih muncul");
  assert(
    `Total omzet berkurang tepat Rp ${targetTrx.total} (${initialOmzet} -> ${afterOmzet})`,
    afterOmzet === initialOmzet - targetTrx.total,
    `Omzet: ${afterOmzet}`
  );
  assert("Total rekap terhapus tercatat 1", afterDelRes.data?.laporan?.totalRekapTerhapus >= 1);

  // 5. Bukti Audit Database Asli
  console.log("\n5. BUKTI AUDIT TABEL TRANSAKSI & REKAP_DIHAPUS DI POSTGRESQL:");
  try {
    const trxDb = execSync(
      `docker exec -i web-app-db psql -U habib -d web_app -t -c "SELECT id_transaksi, total_transaksi, status_pembayaran FROM transaksi WHERE id_transaksi = 'TRX001';"`
    ).toString().trim();
    console.log(`     Data fisik di tabel transaksi : ${trxDb}`);
    assert("Transaksi TRX001 MASIH ADA di tabel transaksi", trxDb.includes("TRX001"), trxDb);

    const rekapDb = execSync(
      `docker exec -i web-app-db psql -U habib -d web_app -t -c "SELECT id_transaksi, dihapus_oleh FROM rekap_dihapus WHERE id_transaksi = 'TRX001';"`
    ).toString().trim();
    console.log(`     Data di tabel rekap_dihapus  : ${rekapDb}`);
    assert("TRX001 tercatat di tabel rekap_dihapus", rekapDb.includes("TRX001"), rekapDb);
  } catch (err) {
    console.error("Gagal query docker psql:", err.message);
  }

  // 6. Verifikasi Ekspor CSV
  console.log("\n6. VERIFIKASI EKSPOR CSV:");
  const csvRes = await request("/api/owner/rekap/export?periode=bulan_ini", { cookie: ownerCookie });
  assert("GET /api/owner/rekap/export berhasil 200", csvRes.status === 200, `Status: ${csvRes.status}`);
  const csvText = typeof csvRes.data === "string" ? csvRes.data : "";
  assert("CSV tidak memuat TRX001", !csvText.includes("TRX001"), "TRX001 ditemukan di CSV");
  assert(`CSV memuat total omzet Rp ${afterOmzet.toLocaleString("id-ID")}`, csvText.includes(`Rp ${afterOmzet.toLocaleString("id-ID")}`));

  // 7. Verifikasi Fitur Pulihkan
  console.log("\n7. VERIFIKASI FITUR PULIHKAN REKAPAN:");
  const deletedViewRes = await request("/api/owner/laporan?periode=bulan_ini&terhapus=true", { cookie: ownerCookie });
  const deletedItems = deletedViewRes.data?.laporan?.transaksi || [];
  assert("Query ?terhapus=true menampilkan TRX001", deletedItems.some((t) => t.id === "TRX001"));

  const restoreRes = await request("/api/owner/rekap/pulihkan", {
    method: "POST",
    cookie: ownerCookie,
    body: { id: "TRX001" },
  });
  assert("POST /api/owner/rekap/pulihkan TRX001 berhasil 200", restoreRes.status === 200, `Status: ${restoreRes.status}`);

  const restoredLaporanRes = await request("/api/owner/laporan?periode=bulan_ini", { cookie: ownerCookie });
  const restoredOmzet = restoredLaporanRes.data?.laporan?.totalOmzet || 0;
  const restoredTrxList = restoredLaporanRes.data?.laporan?.transaksi || [];
  assert("TRX001 muncul kembali di laporan aktif", restoredTrxList.some((t) => t.id === "TRX001"));
  assert("Total omzet kembali ke nilai awal", restoredOmzet === initialOmzet, `Omzet: ${restoredOmzet}`);

  const rekapDbAfter = execSync(
    `docker exec -i web-app-db psql -U habib -d web_app -t -c "SELECT COUNT(*) FROM rekap_dihapus WHERE id_transaksi = 'TRX001';"`
  ).toString().trim();
  assert("Baris TRX001 terhapus dari tabel rekap_dihapus", rekapDbAfter === "0", `Count: ${rekapDbAfter}`);

  console.log("\n======================================================================");
  console.log(`HASIL AKHIR: ${passed} PASS, ${failed} FAIL`);
  console.log("======================================================================\n");

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
