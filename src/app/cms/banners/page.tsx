"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bannerSchema, BannerInput } from "@/lib/validations";
import { ImageUpload } from "@/components/cms/image-upload";
import { Textarea } from "@/components/ui/textarea";

export default function CmsBannersPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: banners, isLoading } = useQuery({
    queryKey: ["cms-banners"],
    queryFn: () => api.get("/cms/banners").then((r) => r.data.data),
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<BannerInput>({
    resolver: zodResolver(bannerSchema),
    defaultValues: { isActive: true, sortOrder: 0 },
  });

  const imageUrl = watch("imageUrl");

  const saveMutation = useMutation({
    mutationFn: (data: BannerInput) =>
      editId ? api.put(`/cms/banners/${editId}`, data) : api.post("/cms/banners", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-banners"] });
      toast.success(editId ? "Banner diperbarui" : "Banner dibuat");
      setOpen(false); reset(); setEditId(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/cms/banners/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cms-banners"] }); toast.success("Banner dihapus"); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal"),
  });

  function openCreate() { reset({ isActive: true, sortOrder: 0, imageUrl: "" }); setEditId(null); setOpen(true); }
  function openEdit(b: any) {
    reset({ title: b.title, description: b.description, imageUrl: b.imageUrl, buttonText: b.buttonText, buttonUrl: b.buttonUrl, sortOrder: b.sortOrder, isActive: b.isActive });
    setEditId(b.id); setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Manajemen Banner</h1>
          <p className="text-sm text-muted-foreground">Kelola banner hero di halaman utama</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Tambah Banner</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !banners?.length ? (
            <div className="p-12 text-center text-muted-foreground">Belum ada banner</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Urutan</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Tombol</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((b: any) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.sortOrder}</TableCell>
                    <TableCell className="font-medium">{b.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{b.buttonText || "-"}</TableCell>
                    <TableCell><Badge variant={b.isActive ? "success" : "outline"}>{b.isActive ? "Aktif" : "Nonaktif"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(b)}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => { if (confirm("Hapus banner?")) deleteMutation.mutate(b.id); }}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Edit Banner" : "Tambah Banner Baru"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-4">
            <div className="space-y-2">
              <Label>Judul *</Label>
              <Input placeholder="Judul banner" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea placeholder="Deskripsi banner" rows={2} {...register("description")} />
            </div>
            <div className="space-y-2">
              <Label>Gambar *</Label>
              <ImageUpload value={imageUrl || ""} onChange={(url) => setValue("imageUrl", url)} folder="/banners" />
              {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teks Tombol</Label>
                <Input placeholder="contoh: Pelajari Lebih Lanjut" {...register("buttonText")} />
              </div>
              <div className="space-y-2">
                <Label>URL Tombol</Label>
                <Input placeholder="/profil atau https://..." {...register("buttonUrl")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Urutan</Label>
                <Input type="number" min={0} {...register("sortOrder", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register("isActive", { setValueAs: (v) => v === "true" || v === true })}>
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
