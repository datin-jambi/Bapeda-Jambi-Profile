"use client"

import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

/** Format wire: "yyyy-MM-dd" (aman untuk query string, tanpa geser timezone). */
const WIRE = "yyyy-MM-dd"

export function toWireDate(d: Date): string {
  return format(d, WIRE)
}

export function fromWireDate(s: string): Date | undefined {
  if (!s) return undefined
  const d = parse(s, WIRE, new Date())
  return isValid(d) ? d : undefined
}

interface DatePickerProps {
  /** Tanggal terpilih dalam format "yyyy-MM-dd"; string kosong = belum dipilih. */
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Batas bawah/atas, format "yyyy-MM-dd". */
  min?: string
  max?: string
  className?: string
  disabled?: boolean
  "aria-label"?: string
}

/**
 * Date picker tunggal: tombol + popover kalender, dengan tombol hapus inline.
 * Nilai keluar-masuk sebagai string "yyyy-MM-dd" agar langsung cocok untuk API.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  min,
  max,
  className,
  disabled,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = fromWireDate(value)
  const minDate = fromWireDate(min ?? "")
  const maxDate = fromWireDate(max ?? "")

  // Batas navigasi default: 5 tahun ke belakang s/d bulan ini, supaya dropdown
  // tahun tidak memuntahkan 100 tahun. Lewati `min`/`max` untuk rentang lain.
  const today = new Date()
  const navStart = minDate ?? new Date(today.getFullYear() - 5, 0, 1)
  const navEnd = maxDate ?? today

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            "h-9 justify-start gap-2 px-3 font-normal",
            !selected && "text-slate-400",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate">
            {selected ? format(selected, "d MMM yyyy", { locale: localeId }) : placeholder}
          </span>
          {selected && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Hapus tanggal"
              className="ml-auto rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              onClick={(e) => {
                e.stopPropagation()
                onChange("")
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange("")
                }
              }}
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? navEnd}
          startMonth={navStart}
          endMonth={navEnd}
          disabled={[
            ...(minDate ? [{ before: minDate }] : []),
            ...(maxDate ? [{ after: maxDate }] : []),
          ]}
          onSelect={(d) => {
            onChange(d ? toWireDate(d) : "")
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
