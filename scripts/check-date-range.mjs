// Self-check rentang tanggal findAll(): dateTo harus INKLUSIF.
// Jalankan: node scripts/check-date-range.mjs
import assert from "node:assert/strict";

// Cerminan logika di src/repositories/vehicle-tax.repository.ts findAll()
function buildRange(dateFrom, dateTo) {
  const range = {};
  if (dateFrom) range.gte = new Date(`${dateFrom}T00:00:00`);
  if (dateTo) {
    const end = new Date(`${dateTo}T00:00:00`);
    end.setDate(end.getDate() + 1);
    range.lt = end;
  }
  return range;
}

const inRange = (d, r) =>
  (!r.gte || d >= r.gte) && (!r.lt || d < r.lt);

// Satu hari: 2026-03-10 harus mencakup seluruh hari itu.
const oneDay = buildRange("2026-03-10", "2026-03-10");
assert.ok(inRange(new Date("2026-03-10T00:00:00"), oneDay), "awal hari masuk");
assert.ok(inRange(new Date("2026-03-10T23:59:59"), oneDay), "akhir hari masuk");
assert.ok(!inRange(new Date("2026-03-09T23:59:59"), oneDay), "hari sebelum keluar");
assert.ok(!inRange(new Date("2026-03-11T00:00:00"), oneDay), "hari sesudah keluar");

// Batas akhir bulan: +1 hari harus menyeberang bulan, bukan jadi tgl 32.
const monthEnd = buildRange(null, "2026-01-31");
assert.equal(monthEnd.lt.getMonth(), 1, "Januari 31 + 1 hari = Februari");
assert.ok(inRange(new Date("2026-01-31T18:00:00"), monthEnd), "31 Jan sore masuk");

// Hanya dateFrom / hanya dateTo tidak boleh bikin batas yang lain.
assert.equal(buildRange("2026-03-10", null).lt, undefined);
assert.equal(buildRange(null, "2026-03-10").gte, undefined);

console.log("OK: rentang tanggal log pajak inklusif di kedua ujung");
