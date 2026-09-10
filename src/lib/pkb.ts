import { request as httpsRequest } from "node:https";
import { checkServerIdentity } from "node:tls";

// api-pkb.jambisamsat.net menyajikan sertifikat untuk seloko.jambisamsat.net,
// sehingga browser menolaknya (ERR_CERT_COMMON_NAME_INVALID) dan fetch biasa
// gagal. Nama itu diterima eksplisit di sini — chain Let's Encrypt tetap
// diverifikasi penuh, jadi ini bukan `rejectUnauthorized: false`.
// ponytail: hapus CERT_CN dan pakai fetch() biasa begitu sertifikat diperbaiki.
const CERT_CN = "seloko.jambisamsat.net";
const HOST = process.env.PKB_API_HOST;
const TOKEN = process.env.PKB_API_TOKEN;

/** Endpoint API Samsat yang boleh dipanggil (slug -> path upstream). */
export const PKB_ENDPOINTS = {
  "kendaraan-detail": "/kendaraan/detail",
  "kendaraan-pnbp": "/kendaraan/pnbp",
  "pajak-detail": "/pajak/detail",
  "jr-detail": "/jr/detail",
} as const;

export type PkbEndpoint = keyof typeof PKB_ENDPOINTS;

export const isPkbEndpoint = (v: string): v is PkbEndpoint => v in PKB_ENDPOINTS;

/** Ambil body mentah dari API Samsat. Melempar bila koneksi gagal. */
export function pkbFetchRaw(endpoint: PkbEndpoint, nopol: string): Promise<string> {
  if (!HOST || !TOKEN) throw new Error("PKB API belum dikonfigurasi");

  const url = new URL(HOST + PKB_ENDPOINTS[endpoint]);
  url.searchParams.set("nopol", nopol);

  return new Promise((resolve, reject) => {
    const req = httpsRequest(
      url,
      {
        headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
        checkServerIdentity: (_host, cert) => checkServerIdentity(CERT_CN, cert),
        timeout: 20_000,
      },
      (res) => {
        let buf = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (buf += c));
        res.on("end", () => resolve(buf));
      }
    );
    req.on("timeout", () => req.destroy(new Error("Timeout menghubungi API Samsat")));
    req.on("error", reject);
    req.end();
  });
}

/** Versi terparsing: mengembalikan `data` bila sukses, `null` bila gagal/kosong. */
export async function pkbFetch<T>(endpoint: PkbEndpoint, nopol: string): Promise<T | null> {
  try {
    const json = JSON.parse(await pkbFetchRaw(endpoint, nopol));
    return json.status && json.data ? (json.data as T) : null;
  } catch {
    return null;
  }
}
