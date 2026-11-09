/**
 * scripts/gen-seed-hashes.mjs
 * Membangkitkan password acak kuat untuk akun seed produksi (Neon),
 * menghitung hash bcrypt (salt 10), memperbarui db/seed.sql,
 * dan MENCETAK password plaintext HANYA ke terminal (tidak disimpan ke file).
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";

const ACCOUNTS = [
  { id: 1, username: "adzra", role: "pelanggan" },
  { id: 2, username: "asqa", role: "pelanggan" },
  { id: 3, username: "habiib", role: "pelanggan" },
  { id: 4, username: "arya", role: "pelanggan" },
  { id: 5, username: "aidil", role: "kasir" },
  { id: 6, username: "aini", role: "kasir" },
  { id: 7, username: "daniel", role: "kitchen" },
  { id: 8, username: "mia", role: "kitchen" },
  { id: 9, username: "owner", role: "owner" },
];

function generateStrongPassword(length = 18) {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ23456789!@#$%^&*-_=+";
  const bytes = crypto.randomBytes(length);
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars[bytes[i] % chars.length];
  }
  return pass;
}

async function main() {
  console.log("================================================================================");
  console.log("  PASSWORD BARU AKUN PRODUKSI (NEON) — SALIN SEKARANG DARI TERMINAL");
  console.log("  PERINGATAN: Password ini HANYA dicetak sekali ke terminal dan TIDAK disimpan.");
  console.log("================================================================================");

  const results = [];
  const insertRows = [];

  for (const acc of ACCOUNTS) {
    const password = generateStrongPassword(18);
    const hash = await bcrypt.hash(password, 10);
    results.push({ ...acc, password, hash });
    insertRows.push(` (${acc.id}, '${acc.username}',  '${hash}', '${acc.role}')`);
  }

  console.log("\nDAFTAR KREDENSIAL PRODUKSI BARU:");
  console.log("--------------------------------------------------------------------------------");
  console.log("ID | Role       | Username | Password Produksi Baru");
  console.log("---+------------+----------+----------------------------------------------------");
  for (const r of results) {
    console.log(
      `${String(r.id).padEnd(2)} | ${r.role.padEnd(10)} | ${r.username.padEnd(8)} | ${r.password}`
    );
  }
  console.log("--------------------------------------------------------------------------------\n");

  const seedFilePath = path.join(process.cwd(), "db/seed.sql");
  let seedContent = fs.readFileSync(seedFilePath, "utf-8");

  // Ganti blok INSERT INTO akun
  const akunRegex = /INSERT INTO akun \(id_akun, username, password_hash, role\) VALUES[\s\S]*?ON CONFLICT \(id_akun\) DO NOTHING;/;
  const newInsertBlock = `INSERT INTO akun (id_akun, username, password_hash, role) VALUES\n${insertRows.join(",\n")}\nON CONFLICT (id_akun) DO NOTHING;`;

  if (!akunRegex.test(seedContent)) {
    console.error("Gagal menemukan blok INSERT INTO akun di db/seed.sql!");
    process.exit(1);
  }

  seedContent = seedContent.replace(akunRegex, newInsertBlock);
  fs.writeFileSync(seedFilePath, seedContent, "utf-8");
  console.log("✓ db/seed.sql berhasil diperbarui dengan hash bcrypt baru untuk produksi Neon.");
}

main().catch((err) => {
  console.error("Gagal membangkitkan hash seed:", err);
  process.exit(1);
});
