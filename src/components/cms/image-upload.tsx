"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import NextImage from "next/image";
import api from "@/lib/axios";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
}

export function ImageUpload({ value, onChange, folder = "/uploads", accept = "image/*" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setUploading(true);
    try {
      const authRes = await api.get("/upload/auth");
      const { token, expire, signature } = authRes.data.data;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "");
      formData.append("signature", signature);
      formData.append("expire", expire);
      formData.append("token", token);
      formData.append("fileName", file.name);
      formData.append("folder", folder);

      const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload gagal");

      const result = await uploadRes.json();
      onChange(result.url);
      toast.success("Gambar berhasil diupload");
    } catch (err) {
      toast.error("Gagal mengupload gambar");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative w-full max-w-sm">
          <div className="relative aspect-video rounded-lg overflow-hidden border bg-gray-50">
            <NextImage src={value} alt="Preview" fill className="object-cover" />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={() => onChange("")}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-primary/50 cursor-pointer transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleUpload(file);
          }}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm">Mengupload...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium">Klik atau drag & drop gambar</p>
              <p className="text-xs">JPG, PNG, WEBP — Maks. 5MB</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
      />

      {!value && (
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload className="mr-2 h-4 w-4" />
          Pilih Gambar
        </Button>
      )}
    </div>
  );
}
