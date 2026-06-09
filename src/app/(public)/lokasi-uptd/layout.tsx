import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lokasi UPTD Samsat",
  description: "Temukan lokasi kantor UPTD Samsat di seluruh Provinsi Jambi pada peta interaktif.",
  keywords: "UPTD, Samsat, lokasi, peta, Jambi, pajak kendaraan",
  openGraph: {
    title: "Lokasi UPTD Samsat — BAPENDA Provinsi Jambi",
    description: "Temukan lokasi kantor UPTD Samsat di seluruh Provinsi Jambi.",
  },
};

export default function LokasiUptdLayout({ children }: { children: React.ReactNode }) {
  return children;
}
