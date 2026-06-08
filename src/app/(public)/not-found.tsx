import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-bold text-primary/20 font-poppins">404</div>
      <h1 className="text-2xl font-bold text-primary mt-4">Halaman Tidak Ditemukan</h1>
      <p className="text-gray-500 mt-2 max-w-md">Halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
      <Button asChild className="mt-6">
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  );
}
