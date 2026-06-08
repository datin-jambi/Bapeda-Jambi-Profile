"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gallerySchema, GalleryInput } from "@/lib/validations";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, Trash2, Send, CheckCircle, XCircle, Eye } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/cms/image-upload";
import { useAuthStore } from "@/store";
import Image from "next/image";

export default function EditGalleryPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: gallery, isLoading } = useQuery({
    queryKey: ["cms-gallery-detail", id],
    queryFn: () => api.get(`/cms/galleries/${id}`).then((r) => r.data.data),
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = useForm<GalleryInput>({
    resolver: zodResolver(gallerySchema),
  });

  const coverImage = watch("coverImage");
  const [newItemUrl, setNewItemUrl] = useState("");
  const [addingItem, setAddingItem] = useState(false);

  useEffect(() => {
    if (gallery) reset({ title: gallery.title, description: gallery.description, coverImage: gallery.coverImage });
  }, [gallery, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: GalleryInput) => api.put(`/cms/galleries/${id}`, data),
    onSuccess: () => { toast.success("Galeri diperbarui"); queryClient.invalidateQueries({ queryKey: ["cms-gallery-detail", id] }); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal"),
  });

  const actionMutation = useMutation({
    mutationFn: (action: string) => api.patch(`/cms/galleries/${id}`, { action }),
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ["cms-gallery-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["cms-galleries"] });
      toast.success(action === "publish" ? "Dipublikasi" : action === "approve" ? "Disetujui" : "Berhasil");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal"),
  });

  const addItemMutation = useMutation({
    mutationFn: (fileUrl: string) => api.post(`/cms/galleries/${id}/items`, { mediaType: "IMAGE", fileUrl }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cms-gallery-detail", id] }); setNewItemUrl(""); setAddingItem(false); toast.success("Foto ditambahkan"); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal"),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => api.delete(`/cms/galleries/${id}/items/${itemId}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cms-gallery-detail", id] }); toast.success("Item dihapus"); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal"),
  });

  if (isLoading) return <div className="space-y-4 max-w-4xl">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;

  const isAdmin = user?.role === "Super_Admin" || user?.role === "Admin";
  const status = gallery?.status;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/cms/galleries"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">Edit Galeri</h1>
          <Badge variant={status === "PUBLISHED" ? "success" : "outline"} className="mt-1">{status}</Badge>
        </div>
        <div className="flex gap-2">
          {status === "DRAFT" && <Button variant="outline" size="sm" onClick={() => actionMutation.mutate("submit")}><Send className="mr-1 h-3 w-3" />Kirim Review</Button>}
          {isAdmin && status === "PENDING_REVIEW" && (
            <>
              <Button variant="outline" size="sm" className="text-green-600" onClick={() => actionMutation.mutate("approve")}><CheckCircle className="mr-1 h-3 w-3" />Setujui</Button>
              <Button variant="outline" size="sm" className="text-red-600" onClick={() => actionMutation.mutate("reject")}><XCircle className="mr-1 h-3 w-3" />Tolak</Button>
            </>
          )}
          {isAdmin && status === "APPROVED" && <Button size="sm" onClick={() => actionMutation.mutate("publish")}><Eye className="mr-1 h-3 w-3" />Publikasi</Button>}
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Informasi Galeri</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Judul *</Label>
              <Input {...register("title")} />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea rows={3} {...register("description")} />
            </div>
            <div className="space-y-2">
              <Label>Gambar Cover</Label>
              <ImageUpload value={coverImage || ""} onChange={(url) => setValue("coverImage", url)} folder="/galleries" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : "Simpan"}
          </Button>
        </div>
      </form>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Foto/Video ({gallery?.items?.length || 0} item)</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setAddingItem(true)}>
              <Plus className="mr-1 h-3 w-3" />Tambah Foto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {addingItem && (
            <div className="mb-4 p-4 border rounded-lg space-y-3">
              <Label>Upload Foto</Label>
              <ImageUpload value={newItemUrl} onChange={setNewItemUrl} folder="/galleries" />
              <div className="flex gap-2">
                <Button size="sm" disabled={!newItemUrl || addItemMutation.isPending} onClick={() => addItemMutation.mutate(newItemUrl)}>
                  {addItemMutation.isPending ? "Menambahkan..." : "Tambahkan"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setAddingItem(false); setNewItemUrl(""); }}>Batal</Button>
              </div>
            </div>
          )}

          {!gallery?.items?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada foto. Klik "Tambah Foto" untuk mulai.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {gallery.items.map((item: any) => (
                <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image src={item.fileUrl} alt={item.title || "Gallery item"} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => { if (confirm("Hapus foto ini?")) deleteItemMutation.mutate(item.id); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
