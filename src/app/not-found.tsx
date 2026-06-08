import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50">
      <div className="text-8xl font-bold text-primary/20 font-poppins">404</div>
      <h1 className="text-2xl font-bold text-primary mt-4">Halaman Tidak Ditemukan</h1>
      <p className="text-gray-500 mt-2 max-w-md">
        Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <div className="flex gap-3 mt-6">
        <Button asChild>
          <Link href="/">Beranda</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/berita">Lihat Berita</Link>
        </Button>
      </div>
    </div>
  );
}
