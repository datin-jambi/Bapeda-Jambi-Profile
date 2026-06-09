"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { FallbackImage } from "@/components/ui/fallback-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { ConfirmDialog } from "@/components/cms/confirm-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bannerSchema, BannerInput } from "@/lib/validations";
import { ImageUpload } from "@/components/cms/image-upload";
import { Textarea } from "@/components/ui/textarea";
import { DataTableFilter } from "@/components/cms/data-table-filter";
import { DataTable, ColumnDef } from "@/components/cms/data-table";
import { DataTablePagination } from "@/components/cms/data-table-pagination";

type Banner = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  sortOrder: number;
  isActive: boolean;
};

type BannerResponse = {
  data: Banner[];
  meta: { page: number; limit: number; totalItems: number; totalPages: number };
};

export default function CmsBannersPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<BannerResponse>({
    queryKey: ["cms-banners", page, pageSize, search, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(pageSize));
      if (search) params.set("search", search);
      if (statusFilter === "active") params.set("active", "true");
      if (statusFilter === "inactive") params.set("active", "false");
      return api.get(`/cms/banners?${params.toString()}`).then((r) => r.data);
    },
  });

  const banners = data?.data ?? [];
  const meta = data?.meta;

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
  function openEdit(b: Banner) {
    reset({ title: b.title, description: b.description, imageUrl: b.imageUrl, buttonText: b.buttonText, buttonUrl: b.buttonUrl, sortOrder: b.sortOrder, isActive: b.isActive });
    setEditId(b.id); setOpen(true);
  }

  function handleSearch(val: string) {
    setSearchInput(val);
    if (val === "") { setSearch(""); setPage(1); }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { setSearch(searchInput); setPage(1); }
  }

  function handleStatusFilter(val: string) { setStatusFilter(val); setPage(1); }
  function handlePageSizeChange(size: number) { setPageSize(size); setPage(1); }

  const columns: ColumnDef<Banner>[] = [
    { key: "sortOrder", header: "Urutan", render: (b) => b.sortOrder },
    { key: "title", header: "Judul", cellClassName: "font-medium", render: (b) => b.title },
    {
      key: "imageUrl", header: "Gambar", render: (b) =>
        b.imageUrl ? (
          <FallbackImage src={b.imageUrl} alt={b.title} fallback="banner" width={100} height={60} className="rounded object-cover" />
        ) : (
          <span className="text-xs text-muted-foreground">Tidak ada gambar</span>
        ),
    },
    { key: "buttonText", header: "Tombol", cellClassName: "text-sm text-muted-foreground", render: (b) => b.buttonText || "-" },
    {
      key: "isActive", header: "Status", render: (b) =>
        <Badge variant={b.isActive ? "success" : "outline"}>{b.isActive ? "Aktif" : "Nonaktif"}</Badge>,
    },
    {
      key: "actions", header: "Aksi", headerClassName: "text-right", cellClassName: "text-right",
      render: (b) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(b)}><Pencil className="h-3 w-3" /></Button>
          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setDeleteId(b.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Manajemen Banner</h1>
          <p className="text-sm text-muted-foreground">Kelola banner hero di halaman utama</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Tambah Banner</Button>
      </div>

      <DataTableFilter
        value={searchInput}
        onChange={handleSearch}
        onKeyDown={handleSearchKeyDown}
        placeholder="Cari judul... (Enter untuk cari)"
        selects={[
          {
            value: statusFilter,
            onChange: handleStatusFilter,
            placeholder: "Status",
            allLabel: "Semua Status",
            options: [
              { label: "Aktif", value: "active" },
              { label: "Nonaktif", value: "inactive" },
            ],
          },
        ]}
      />

      <DataTable
        data={banners}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Belum ada banner"
      />

      <DataTablePagination
        page={page}
        totalPages={meta?.totalPages ?? 1}
        totalItems={meta?.totalItems ?? 0}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => { if (!v) setDeleteId(null); }}
        title="Hapus Banner"
        description="Banner yang dihapus tidak dapat dikembalikan. Lanjutkan?"
        confirmLabel="Ya, Hapus"
        loading={deleteMutation.isPending}
        onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId, { onSettled: () => setDeleteId(null) }); }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0 max-h-[90vh] flex flex-col">
          <VisuallyHidden.Root>
            <DialogTitle>{editId ? "Edit Banner" : "Tambah Banner Baru"}</DialogTitle>
          </VisuallyHidden.Root>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">{editId ? "Edit Banner" : "Tambah Banner Baru"}</h2>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
