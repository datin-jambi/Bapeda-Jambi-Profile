import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { vehicleTaxRepository } from "@/repositories/vehicle-tax.repository";
import { vehicleTaxCheckSchema, vehicleTaxCheckInputSchema } from "@/lib/validations";
import { ApiResponse, getPaginationParams, buildMeta } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";
import { hasPermission } from "@/types";

// ─── Samsat API Config ────────────────────────────────────────────────────────

const SAMSAT_HOST = process.env.NEXT_PUBLIC_PKB_API_HOST;
const SAMSAT_TOKEN = process.env.NEXT_PUBLIC_PKB_API_TOKEN;

interface KendaraanData {
  no_polisi: string;
  nm_merek_kb: string;
  nm_model_kb: string;
  nm_jenis_kb: string;
  th_rakitan: string;
  warna_kb: string;
  jumlah_cc: number;
  tg_akhir_pkb: string;
  tg_akhir_stnk: string;
  bbm?: { nama: string };
  njkb?: { nilai_jual: string };
}

interface PajakData {
  terakhir_bayar: string;
  jarak: { tahun: number; bulan: number };
  tagihan: {
    total: {
      grand_total: string;
      pkb: { pokok: string; denda: string };
      opsen: { pokok: string; denda: string };
    };
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeNopol(raw: string): string {
  const val = raw.trim().toUpperCase().replace(/\s+/g, " ");
  if (/^[A-Z]{1,2}[\s\d]/.test(val)) return val;
  return "BH " + val;
}

function parseRupiah(str?: string): number {
  if (!str || str === "-") return 0;
  const cleaned = str.replace(/[^0-9,.]/g, "").replace(/\./g, "").replace(",", ".");
  return Math.round(parseFloat(cleaned) || 0);
}

function isSudahBayar(pajak: PajakData): boolean {
  return parseRupiah(pajak.tagihan.total.grand_total) === 0 || pajak.jarak.bulan === 0;
}

function shouldShowTagihan(tgAkhirPkb: string): boolean {
  const jatuhTempo = new Date(tgAkhirPkb);
  const batas = new Date();
  batas.setMonth(batas.getMonth() + 3);
  return jatuhTempo <= batas;
}

async function samsatFetch<T>(path: string, nopol: string): Promise<T | null> {
  try {
    const res = await fetch(`${SAMSAT_HOST}${path}?nopol=${encodeURIComponent(nopol)}`, {
      headers: {
        Authorization: `Bearer ${SAMSAT_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    const json = await res.json();
    return json.status && json.data ? json.data : null;
  } catch {
    return null;
  }
}

// ─── GET /api/cms/pajak-kendaraan — list logs ────────────────────────────────

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "cek:pajak")) throw new ForbiddenError("Tidak memiliki akses");

  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPaginationParams(searchParams);
  const search = searchParams.get("search") || undefined;

  const isAdmin = user.role === "Super_Admin" || user.role === "Admin";
  const userId = isAdmin ? undefined : user.id;

  const { data, total } = await vehicleTaxRepository.findAll({
    page,
    limit,
    skip,
    userId,
    search,
  });

  return ApiResponse.paginated(data, buildMeta(page, limit, total));
});

// ─── POST /api/cms/pajak-kendaraan — check nopol atau save log ───────────────

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "cek:pajak")) throw new ForbiddenError("Tidak memiliki akses");

  const body = await request.json();

  // ── Mode: Check nopol via Samsat API ────────────────────────────────────
  if (body.action === "check") {
    const parsed = vehicleTaxCheckInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        "Data tidak valid",
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const nopol = normalizeNopol(parsed.data.licensePlate);

    // 1. Ambil data kendaraan
    const kendaraan = await samsatFetch<KendaraanData>("/kendaraan/detail", nopol);
    if (!kendaraan) {
      return ApiResponse.error("Data kendaraan tidak ditemukan", 404);
    }

    // 2. Tentukan status pajak
    let status: "Lunas" | "Belum Lunas";
    let tagihanInfo: {
      terakhirBayar?: string;
      jatuhTempo?: string;
      grandTotal?: string;
      tahunTelat?: number;
      bulanTelat?: number;
    } | null = null;

    if (!shouldShowTagihan(kendaraan.tg_akhir_pkb)) {
      // Tagihan belum muncul (jatuh tempo > 3 bulan lagi)
      status = "Lunas";
      tagihanInfo = {
        jatuhTempo: kendaraan.tg_akhir_pkb,
        grandTotal: "0",
      };
    } else {
      // Tagihan sudah muncul, cek detail pajak
      const pajak = await samsatFetch<PajakData>("/pajak/detail", nopol);

      if (!pajak || isSudahBayar(pajak)) {
        status = "Lunas";
        tagihanInfo = {
          terakhirBayar: pajak?.terakhir_bayar,
          grandTotal: "0",
          tahunTelat: pajak?.jarak.tahun,
          bulanTelat: pajak?.jarak.bulan,
        };
      } else {
        status = "Belum Lunas";
        tagihanInfo = {
          terakhirBayar: pajak.terakhir_bayar,
          jatuhTempo: kendaraan.tg_akhir_pkb,
          grandTotal: pajak.tagihan.total.grand_total,
          tahunTelat: pajak.jarak.tahun,
          bulanTelat: pajak.jarak.bulan,
        };
      }
    }

    return ApiResponse.success(
      {
        licensePlate: kendaraan.no_polisi,
        status,
        kendaraan: {
          merek: kendaraan.nm_merek_kb,
          model: kendaraan.nm_model_kb,
          jenis: kendaraan.nm_jenis_kb,
          tahun: kendaraan.th_rakitan,
          warna: kendaraan.warna_kb,
          cc: kendaraan.jumlah_cc,
          bbm: kendaraan.bbm?.nama,
          njkb: kendaraan.njkb?.nilai_jual,
          tgAkhirPkb: kendaraan.tg_akhir_pkb,
          tgAkhirStnk: kendaraan.tg_akhir_stnk,
        },
        tagihan: tagihanInfo,
        checkedAt: new Date().toISOString(),
      },
      "Pengecekan berhasil"
    );
  }

  // ── Mode: Save log ──────────────────────────────────────────────────────
  const parsed = vehicleTaxCheckSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(
      "Data tidak valid",
      parsed.error.flatten().fieldErrors as Record<string, string[]>
    );
  }

  const log = await vehicleTaxRepository.create({
    userId: user.id,
    licensePlate: parsed.data.licensePlate.toUpperCase(),
    status: parsed.data.status,
    notes: parsed.data.notes,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    lokasi: parsed.data.lokasi,
  });

  return ApiResponse.created(log, "Log pengecekan berhasil disimpan");
});
