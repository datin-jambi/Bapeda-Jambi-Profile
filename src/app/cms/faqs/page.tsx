"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faqSchema, FaqInput } from "@/lib/validations";

export default function CmsFaqsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["faq-categories"],
    queryFn: () => api.get("/cms/faq-categories").then((r) => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["cms-faqs"],
    queryFn: () => api.get("/cms/faqs?limit=100").then((r) => r.data.data),
  });

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<FaqInput>({
    resolver: zodResolver(faqSchema),
    defaultValues: { isPublished: false, sortOrder: 0 },
  });

  const saveMutation = useMutation({
    mutationFn: (data: FaqInput) =>
      editId ? api.put(`/cms/faqs/${editId}`, data) : api.post("/cms/faqs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-faqs"] });
      toast.success(editId ? "FAQ diperbarui" : "FAQ dibuat");
      setOpen(false);
      reset();
      setEditId(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/cms/faqs/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cms-faqs"] }); toast.success("FAQ dihapus"); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal"),
  });

  function openCreate() { reset({ isPublished: false, sortOrder: 0 }); setEditId(null); setOpen(true); }
  function openEdit(faq: any) {
    reset({ categoryId: faq.categoryId, question: faq.question, answer: faq.answer, sortOrder: faq.sortOrder, isPublished: faq.isPublished });
    setEditId(faq.id);
    setOpen(true);
  }

  const faqs = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Manajemen FAQ</h1>
          <p className="text-sm text-muted-foreground">Kelola pertanyaan yang sering diajukan</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Tambah FAQ</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : faqs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Belum ada FAQ</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pertanyaan</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urutan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map((faq: any) => (
                  <TableRow key={faq.id}>
                    <TableCell className="font-medium max-w-xs">
                      <p className="truncate">{faq.question}</p>
                    </TableCell>
                    <TableCell><Badge variant="outline">{faq.category?.name}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={faq.isPublished ? "success" : "outline"}>
                        {faq.isPublished ? "Dipublikasi" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>{faq.sortOrder}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(faq)}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => { if (confirm("Hapus FAQ ini?")) deleteMutation.mutate(faq.id); }}><Trash2 className="h-3 w-3" /></Button>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit FAQ" : "Tambah FAQ Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-4">
            <div className="space-y-2">
              <Label>Kategori *</Label>
              <Select onValueChange={(v) => setValue("categoryId", parseInt(v, 10))}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Pertanyaan *</Label>
              <Input placeholder="Masukkan pertanyaan" {...register("question")} />
              {errors.question && <p className="text-xs text-destructive">{errors.question.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Jawaban *</Label>
              <Textarea placeholder="Masukkan jawaban" rows={5} {...register("answer")} />
              {errors.answer && <p className="text-xs text-destructive">{errors.answer.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Urutan</Label>
                <Input type="number" min={0} {...register("sortOrder", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Status Publikasi</Label>
                <Select onValueChange={(v) => setValue("isPublished", v === "true")} defaultValue="false">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Dipublikasi</SelectItem>
                    <SelectItem value="false">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" loading={isSubmitting}>Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
