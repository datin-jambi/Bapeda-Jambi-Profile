"use client";

// Halaman uji sementara untuk DatePicker — dihapus setelah verifikasi.
import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";

export default function TmpDatePickerCheck() {
  const [v, setV] = useState("");
  return (
    <div className="p-10">
      <DatePicker value={v} onChange={setV} className="w-[200px]" />
      <p className="mt-4 text-sm" data-testid="val">
        value={v || "(kosong)"}
      </p>
    </div>
  );
}
