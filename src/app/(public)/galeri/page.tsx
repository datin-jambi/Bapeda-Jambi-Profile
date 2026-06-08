import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Images } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Galeri foto dan video kegiatan BAPENDA Provinsi Jambi",
};

export default async function GaleriPage() {
  const galleries = await prisma.gallery.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-poppins text-primary">Galeri</h1>
        <p className="text-gray-500 mt-2">Dokumentasi kegiatan BAPENDA Provinsi Jambi</p>
      </div>

      {galleries.length === 0 ? (
        <div className="text-center py-16 text-gray-400 flex flex-col items-center gap-3">
          <Images className="h-12 w-12 text-gray-200" />
          <p>Belum ada galeri</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((g) => (
            <Link key={g.id} href={`/galeri/${g.id}`} className="group block">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                {g.coverImage ? (
                  <Image src={g.coverImage} alt={g.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                    <Images className="h-12 w-12 text-primary/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-3">
                <h2 className="font-semibold text-gray-800 group-hover:text-primary transition-colors">{g.title}</h2>
                {g.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{g.description}</p>}
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Images className="h-3 w-3" />{g._count.items} item
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
