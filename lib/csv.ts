/**
 * lib/csv.ts
 * Utilitas pembentukan file CSV murni (tanpa library eksternal)
 * Dilengkapi UTF-8 BOM (\uFEFF) agar terbaca sempurna di Microsoft Excel dan LibreOffice Calc.
 */

export function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) {
    return "";
  }

  const str = String(val);
  // Jika mengandung tanda kutip, koma, titik koma, atau baris baru, lakukan quoting & escaping
  if (/[",\n\r;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function formatCsv(rows: (string | number | null | undefined)[][]): string {
  // UTF-8 BOM: \uFEFF menjamin Excel membuka file dengan encoding UTF-8 tanpa teks rusak
  const BOM = "\uFEFF";
  const body = rows
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");

  return BOM + body;
}
