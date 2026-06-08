"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uptdSchema, UptdInput } from "@/lib/validations";
import { Textarea } from "@/components/ui/textarea";

export default function CmsUptdPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: uptds, isLoading } = useQuery({
    queryKey: ["cms-uptd"],
    queryFn: () => api.get("/cms/uptd").then((r) => r.data.data),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UptdInput>({
    resolver: zodResolver(uptdSchema),
    defaultValues: { isActive: true },
  });

  const saveMutation = useMutation({
    mutationFn: (data: UptdInput) =>
      editId ? api.put(`/cms/uptd/${editId}`, data) : api.post("/cms/uptd", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-uptd"] });
      toast.success(editId ? "UPTD diperbarui" : "UPTD dibuat");
      setOpen(false); reset(); setEditId(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/cms/uptd/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cms-uptd"] }); toast.success("UPTD dihapus"); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal"),
  });

  function openCreate() { reset({ isActive: true }); setEditId(null); setOpen(true); }
  function openEdit(u: any) {
    reset({ code: u.code, name: u.name, address: u.address, phone: u.phone, email: u.email, headName: u.headName, isActive: u.isActive });
    setEditId(u.id); setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Manajemen UPTD</h1>
          <p className="text-sm text-muted-foreground">Kelola Unit Pelaksana Teknis Daerah Samsat</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Tambah UPTD</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !uptds?.length ? (
            <div className="p-12 text-center text-muted-foreground">Belum ada UPTD</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama UPTD</TableHead>
                  <TableHead>Kepala</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uptds.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-mono text-sm">{u.code}</TableCell>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.headName || "-"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.phone || "-"}</TableCell>
                    <TableCell><Badge variant={u.isActive ? "success" : "outline"}>{u.isActive ? "Aktif" : "Nonaktif"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(u)}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => { if (confirm(`Hapus UPTD ${u.name}?`)) deleteMutation.mutate(u.id); }}><Trash2 className="h-3 w-3" /></Button>
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
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? "Edit UPTD" : "Tambah UPTD Baru"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kode UPTD *</Label>
                <Input placeholder="UPTD-001" {...register("code")} />
                {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register("isActive", { setValueAs: (v) => v === "true" || v === true })}>
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nama UPTD *</Label>
              <Input placeholder="UPTD Samsat Kota Jambi" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Nama Kepala</Label>
              <Input placeholder="Dr. H. Ahmad, M.Si" {...register("headName")} />
            </div>
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Textarea placeholder="Alamat UPTD" rows={2} {...register("address")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telepon</Label>
                <Input placeholder="0741-xxxxx" {...register("phone")} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="uptd@bapenda.go.id" {...register("email")} />
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
