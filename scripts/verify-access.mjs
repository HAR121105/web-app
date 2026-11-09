/**
 * scripts/verify-access.mjs
 * Skrip pengujian HTTP nyata untuk verifikasi RBAC, permission matrix, dan business rules.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const credentials = {
  pelanggan: {
    username: process.env.TEST_USER_PELANGGAN || "adzra",
    password: process.env.TEST_PASSWORD_PELANGGAN,
  },
  pelanggan2: {
    username: process.env.TEST_USER_PELANGGAN2 || "asqa",
    password: process.env.TEST_PASSWORD_PELANGGAN2,
  },
  kasir: {
    username: process.env.TEST_USER_KASIR || "aidil",
    password: process.env.TEST_PASSWORD_KASIR,
  },
  kitchen: {
    username: process.env.TEST_USER_KITCHEN || "daniel",
    password: process.env.TEST_PASSWORD_KITCHEN,
  },
  owner: {
    username: process.env.TEST_USER_OWNER || "owner",
    password: process.env.TEST_PASSWORD_OWNER,
  },
};

// Validasi keberadaan password environment variables
const missingEnvs = Object.entries(credentials)
  .filter(([, v]) => !v.password)
  .map(([k]) => {
    switch (k) {
      case "pelanggan":
        return "TEST_PASSWORD_PELANGGAN";
      case "pelanggan2":
        return "TEST_PASSWORD_PELANGGAN2";
      case "kasir":
        return "TEST_PASSWORD_KASIR";
      case "kitchen":
        return "TEST_PASSWORD_KITCHEN";
      case "owner":
        return "TEST_PASSWORD_OWNER";
      default:
        return k;
    }
  });

if (missingEnvs.length > 0) {
  console.error("======================================================================");
  console.error("  PERINGATAN: Variabel lingkungan password pengujian belum diatur!");
  console.error("======================================================================");
  console.error("Variabel berikut diperlukan untuk menjalankan skrip uji HTTP nyata:");
  missingEnvs.forEach((env) => console.error(`  - ${env}`));
  console.error("\nSilakan set variabel di terminal Anda sebelum menjalankan skrip ini:");
  console.error("  export TEST_PASSWORD_PELANGGAN=...");
  console.error("  export TEST_PASSWORD_PELANGGAN2=...");
  console.error("  export TEST_PASSWORD_KASIR=...");
  console.error("  export TEST_PASSWORD_KITCHEN=...");
  console.error("  export TEST_PASSWORD_OWNER=...");
  console.error("\nLalu jalankan kembali:");
  console.error("  node scripts/verify-access.mjs\n");
  process.exit(2);
}

const cookies = {
  pelanggan: null,
  pelanggan2: null,
  kasir: null,
  kitchen: null,
  owner: null,
};

async function loginUser(roleKey) {
  const cred = credentials[roleKey];
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: cred.username,
      password: cred.password,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login gagal untuk role ${roleKey} (${cred.username}): HTTP ${res.status} - ${text}`);
  }

  // Ambil cookie dari Set-Cookie
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) {
    throw new Error(`Header Set-Cookie tidak ditemukan saat login ${roleKey}`);
  }

  // Ekstrak donat_session_token=<val>
  const match = setCookie.match(/donat_session_token=([^;]+)/);
  if (!match) {
    throw new Error(`Cookie donat_session_token tidak ditemukan untuk ${roleKey}`);
  }

  return `donat_session_token=${match[1]}`;
}

async function apiRequest(path, { method = "GET", body = null, cookie = null } = {}) {
  const headers = {};
  if (cookie) {
    headers["Cookie"] = cookie;
  }
  if (body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  return { status: res.status, data: json, headers: res.headers };
}

async function runTests() {
  console.log("======================================================================");
  console.log(`  VERIFIKASI HTTP ENDPOINT TOKO DONAT HABIL (${BASE_URL})`);
  console.log("======================================================================\n");

  // Melakukan login untuk setiap role
  console.log("Melakukan login untuk setiap role...");
  for (const roleKey of Object.keys(credentials)) {
    try {
      cookies[roleKey] = await loginUser(roleKey);
      console.log(`  [OK] Login ${roleKey} (${credentials[roleKey].username}) berhasil`);
    } catch (err) {
      console.error(`  [FAIL] ${err.message}`);
      process.exit(1);
    }
  }

  let passed = 0;
  let failed = 0;
  const testResults = [];

  function record(name, condition, expected, actual) {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
      testResults.push({ name, status: "PASS", expected, actual });
    } else {
      console.error(`  [FAIL] ${name} (Expected: ${expected}, Actual: ${actual})`);
      failed++;
      testResults.push({ name, status: "FAIL", expected, actual });
    }
  }

  console.log("\n--- BAGIAN 1: PENGUJIAN MATRIKS OTORISASI (RBAC) ---");

  // Matriks endpoint
  // 1. GET /api/auth/me (bisa diakses semua yang login, 401 jika unauth)
  {
    const resNoAuth = await apiRequest("/api/auth/me");
    record("GET /api/auth/me tanpa cookie -> 401", resNoAuth.status === 401, 401, resNoAuth.status);

    const resAuth = await apiRequest("/api/auth/me", { cookie: cookies.pelanggan });
    record("GET /api/auth/me pelanggan -> 200", resAuth.status === 200, 200, resAuth.status);
  }

  // 2. GET /api/pesanan (hanya pelanggan)
  {
    const noAuth = await apiRequest("/api/pesanan");
    record("GET /api/pesanan tanpa cookie -> 401", noAuth.status === 401, 401, noAuth.status);

    const kasirAuth = await apiRequest("/api/pesanan", { cookie: cookies.kasir });
    record("GET /api/pesanan kasir -> 403", kasirAuth.status === 403, 403, kasirAuth.status);

    const plgAuth = await apiRequest("/api/pesanan", { cookie: cookies.pelanggan });
    record("GET /api/pesanan pelanggan -> 200", plgAuth.status === 200, 200, plgAuth.status);
  }

  // 3. POST /api/pesanan (hanya pelanggan)
  {
    const noAuth = await apiRequest("/api/pesanan", { method: "POST", body: {} });
    record("POST /api/pesanan tanpa cookie -> 401", noAuth.status === 401, 401, noAuth.status);

    const kasirAuth = await apiRequest("/api/pesanan", { method: "POST", body: {}, cookie: cookies.kasir });
    record("POST /api/pesanan kasir -> 403", kasirAuth.status === 403, 403, kasirAuth.status);
  }

  // 4. GET /api/kasir/pesanan (hanya kasir)
  {
    const noAuth = await apiRequest("/api/kasir/pesanan");
    record("GET /api/kasir/pesanan tanpa cookie -> 401", noAuth.status === 401, 401, noAuth.status);

    const plgAuth = await apiRequest("/api/kasir/pesanan", { cookie: cookies.pelanggan });
    record("GET /api/kasir/pesanan pelanggan -> 403", plgAuth.status === 403, 403, plgAuth.status);

    const kasirAuth = await apiRequest("/api/kasir/pesanan", { cookie: cookies.kasir });
    record("GET /api/kasir/pesanan kasir -> 200", kasirAuth.status === 200, 200, kasirAuth.status);
  }

  // 5. PATCH /api/transaksi/[id] (hanya kasir)
  {
    const noAuth = await apiRequest("/api/transaksi/NONEXISTENT", { method: "PATCH", body: { status: "valid" } });
    record("PATCH /api/transaksi/NONEXISTENT tanpa cookie -> 401", noAuth.status === 401, 401, noAuth.status);

    const kitchenAuth = await apiRequest("/api/transaksi/NONEXISTENT", { method: "PATCH", body: { status: "valid" }, cookie: cookies.kitchen });
    record("PATCH /api/transaksi/NONEXISTENT kitchen -> 403", kitchenAuth.status === 403, 403, kitchenAuth.status);

    const kasirAuth = await apiRequest("/api/transaksi/NONEXISTENT", { method: "PATCH", body: { status: "valid" }, cookie: cookies.kasir });
    record("PATCH /api/transaksi/NONEXISTENT kasir -> 404", kasirAuth.status === 404, 404, kasirAuth.status);
  }

  // 6. PATCH /api/pesanan/[id]/serahkan (hanya kasir)
  {
    const noAuth = await apiRequest("/api/pesanan/NONEXISTENT/serahkan", { method: "PATCH" });
    record("PATCH /api/pesanan/NONEXISTENT/serahkan tanpa cookie -> 401", noAuth.status === 401, 401, noAuth.status);

    const plgAuth = await apiRequest("/api/pesanan/NONEXISTENT/serahkan", { method: "PATCH", cookie: cookies.pelanggan });
    record("PATCH /api/pesanan/NONEXISTENT/serahkan pelanggan -> 403", plgAuth.status === 403, 403, plgAuth.status);

    const kasirAuth = await apiRequest("/api/pesanan/NONEXISTENT/serahkan", { method: "PATCH", cookie: cookies.kasir });
    record("PATCH /api/pesanan/NONEXISTENT/serahkan kasir -> 404", kasirAuth.status === 404, 404, kasirAuth.status);
  }

  // 7. GET /api/transaksi/[id]/struk (kasir, pelanggan, owner)
  {
    const noAuth = await apiRequest("/api/transaksi/NONEXISTENT/struk");
    record("GET /api/transaksi/NONEXISTENT/struk tanpa cookie -> 401", noAuth.status === 401, 401, noAuth.status);

    const kitchenAuth = await apiRequest("/api/transaksi/NONEXISTENT/struk", { cookie: cookies.kitchen });
    record("GET /api/transaksi/NONEXISTENT/struk kitchen -> 403", kitchenAuth.status === 403, 403, kitchenAuth.status);

    const kasirAuth = await apiRequest("/api/transaksi/NONEXISTENT/struk", { cookie: cookies.kasir });
    record("GET /api/transaksi/NONEXISTENT/struk kasir -> 404", kasirAuth.status === 404, 404, kasirAuth.status);
  }

  // 8. GET /api/kasir/rekap (kasir, owner)
  {
    const noAuth = await apiRequest("/api/kasir/rekap");
    record("GET /api/kasir/rekap tanpa cookie -> 401", noAuth.status === 401, 401, noAuth.status);

    const plgAuth = await apiRequest("/api/kasir/rekap", { cookie: cookies.pelanggan });
    record("GET /api/kasir/rekap pelanggan -> 403", plgAuth.status === 403, 403, plgAuth.status);

    const kasirAuth = await apiRequest("/api/kasir/rekap", { cookie: cookies.kasir });
    record("GET /api/kasir/rekap kasir -> 200", kasirAuth.status === 200, 200, kasirAuth.status);

    const ownerAuth = await apiRequest("/api/kasir/rekap", { cookie: cookies.owner });
    record("GET /api/kasir/rekap owner -> 200", ownerAuth.status === 200, 200, ownerAuth.status);
  }

  // 9. GET /api/kitchen/antrean (hanya kitchen)
  {
    const noAuth = await apiRequest("/api/kitchen/antrean");
    record("GET /api/kitchen/antrean tanpa cookie -> 401", noAuth.status === 401, 401, noAuth.status);

    const plgAuth = await apiRequest("/api/kitchen/antrean", { cookie: cookies.pelanggan });
    record("GET /api/kitchen/antrean pelanggan -> 403", plgAuth.status === 403, 403, plgAuth.status);

    const kitchenAuth = await apiRequest("/api/kitchen/antrean", { cookie: cookies.kitchen });
    record("GET /api/kitchen/antrean kitchen -> 200", kitchenAuth.status === 200, 200, kitchenAuth.status);
  }

  // 10. PATCH /api/pesanan/[id]/estimasi (hanya kitchen)
  {
    const noAuth = await apiRequest("/api/pesanan/NONEXISTENT/estimasi", { method: "PATCH", body: { estimasi_menit: 15 } });
    record("PATCH /api/pesanan/NONEXISTENT/estimasi tanpa cookie -> 401", noAuth.status === 401, 401, noAuth.status);

    const kasirAuth = await apiRequest("/api/pesanan/NONEXISTENT/estimasi", { method: "PATCH", body: { estimasi_menit: 15 }, cookie: cookies.kasir });
    record("PATCH /api/pesanan/NONEXISTENT/estimasi kasir -> 403", kasirAuth.status === 403, 403, kasirAuth.status);

    const kitchenAuth = await apiRequest("/api/pesanan/NONEXISTENT/estimasi", { method: "PATCH", body: { estimasi_menit: 15 }, cookie: cookies.kitchen });
    record("PATCH /api/pesanan/NONEXISTENT/estimasi kitchen -> 404", kitchenAuth.status === 404, 404, kitchenAuth.status);
  }

  // 11. PATCH /api/pesanan/[id]/status (hanya kitchen)
  {
    const noAuth = await apiRequest("/api/pesanan/NONEXISTENT/status", { method: "PATCH", body: { status_pesanan: "Siap Diambil" } });
    record("PATCH /api/pesanan/NONEXISTENT/status tanpa cookie -> 401", noAuth.status === 401, 401, noAuth.status);

    const plgAuth = await apiRequest("/api/pesanan/NONEXISTENT/status", { method: "PATCH", body: { status_pesanan: "Siap Diambil" }, cookie: cookies.pelanggan });
    record("PATCH /api/pesanan/NONEXISTENT/status pelanggan -> 403", plgAuth.status === 403, 403, plgAuth.status);

    const kitchenAuth = await apiRequest("/api/pesanan/NONEXISTENT/status", { method: "PATCH", body: { status_pesanan: "Siap Diambil" }, cookie: cookies.kitchen });
    record("PATCH /api/pesanan/NONEXISTENT/status kitchen -> 404", kitchenAuth.status === 404, 404, kitchenAuth.status);
  }

  // 12. GET & PATCH /api/kitchen/persediaan (hanya kitchen)
  {
    const noAuth = await apiRequest("/api/kitchen/persediaan");
    record("GET /api/kitchen/persediaan tanpa cookie -> 401", noAuth.status === 401, 401, noAuth.status);

    const kasirAuth = await apiRequest("/api/kitchen/persediaan", { cookie: cookies.kasir });
    record("GET /api/kitchen/persediaan kasir -> 403", kasirAuth.status === 403, 403, kasirAuth.status);

    const kitchenAuth = await apiRequest("/api/kitchen/persediaan", { cookie: cookies.kitchen });
    record("GET /api/kitchen/persediaan kitchen -> 200", kitchenAuth.status === 200, 200, kitchenAuth.status);

    const patchKitchenAuth = await apiRequest("/api/kitchen/persediaan/NONEXISTENT", { method: "PATCH", body: { delta: 10 }, cookie: cookies.kitchen });
    record("PATCH /api/kitchen/persediaan/NONEXISTENT kitchen -> 404", patchKitchenAuth.status === 404, 404, patchKitchenAuth.status);
  }

  // 13. GET /api/owner/laporan (hanya owner)
  {
    const noAuth = await apiRequest("/api/owner/laporan");
    record("GET /api/owner/laporan tanpa cookie -> 401", noAuth.status === 401, 401, noAuth.status);

    const kasirAuth = await apiRequest("/api/owner/laporan", { cookie: cookies.kasir });
    record("GET /api/owner/laporan kasir -> 403", kasirAuth.status === 403, 403, kasirAuth.status);

    const ownerAuth = await apiRequest("/api/owner/laporan", { cookie: cookies.owner });
    record("GET /api/owner/laporan owner -> 200", ownerAuth.status === 200, 200, ownerAuth.status);
  }

  console.log("\n--- BAGIAN 2: PENGUJIAN BUSINESS RULES & ATOMISITAS ---");

  // Uji 1: POST /api/pesanan QRIS tanpa bukti -> 400
  {
    const res = await apiRequest("/api/pesanan", {
      method: "POST",
      body: {
        metode_pembayaran: "QRIS",
        items: [{ id_menu: "MN001", jumlah: 1 }],
      },
      cookie: cookies.pelanggan,
    });
    record("POST /api/pesanan QRIS tanpa bukti bayar -> 400", res.status === 400, 400, res.status);
  }

  // Uji 2: Token cookie yang dimanipulasi -> 401
  {
    const tamperedCookie = cookies.pelanggan.slice(0, -6) + "xxxxxx";
    const res = await apiRequest("/api/auth/me", { cookie: tamperedCookie });
    record("Token cookie yang dimanipulasi -> 401", res.status === 401, 401, res.status);
  }

  // Uji 3 & 4: Alur pesanan nyata, penolakan ulasan antar-pelanggan, dan tolak validasi ulang (409)
  {
    // Buat pesanan Tunai yang valid
    const orderRes = await apiRequest("/api/pesanan", {
      method: "POST",
      body: {
        metode_pembayaran: "Tunai",
        items: [{ id_menu: "MN001", jumlah: 1 }],
      },
      cookie: cookies.pelanggan,
    });

    if (orderRes.status !== 201) {
      record("Pembuatan pesanan uji Tunai oleh Pelanggan A -> 201", false, 201, orderRes.status);
    } else {
      record("Pembuatan pesanan uji Tunai oleh Pelanggan A -> 201", true, 201, 201);
      const createdPesananId = orderRes.data.pesanan.id_pesanan;
      const createdTransaksiId = orderRes.data.transaksi.id_transaksi;

      // Uji: Pelanggan B mencoba memberi ulasan pada pesanan Pelanggan A -> 403
      const ulasanRes = await apiRequest("/api/ulasan", {
        method: "POST",
        body: {
          id_pesanan: createdPesananId,
          kritik_pelanggan: "Bukan pesanan saya",
          saran_pelanggan: "Coba bypass",
        },
        cookie: cookies.pelanggan2,
      });
      record("Pelanggan B mencoba ulas pesanan Pelanggan A -> 403", ulasanRes.status === 403, 403, ulasanRes.status);

      // Kasir validasi pembayaran pertama kali -> 200
      const val1Res = await apiRequest(`/api/transaksi/${createdTransaksiId}`, {
        method: "PATCH",
        body: { status: "valid" },
        cookie: cookies.kasir,
      });
      record("Kasir validasi pembayaran pertama kali -> 200", val1Res.status === 200, 200, val1Res.status);

      // Kasir validasi pembayaran kedua kali -> 409 (Tolak validasi ulang)
      const val2Res = await apiRequest(`/api/transaksi/${createdTransaksiId}`, {
        method: "PATCH",
        body: { status: "valid" },
        cookie: cookies.kasir,
      });
      record("Kasir validasi pembayaran kedua kali pada transaksi yang sama -> 409", val2Res.status === 409, 409, val2Res.status);
    }
  }

  console.log("\n======================================================================");
  console.log(`RINGKASAN UJI: ${passed} PASS, ${failed} FAIL`);
  console.log("======================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Kesalahan tak terduga saat pengujian:", err);
  process.exit(1);
});
