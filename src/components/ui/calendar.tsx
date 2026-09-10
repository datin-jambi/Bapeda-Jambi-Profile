"use client"

import * as React from "react"
import { DayPicker, type DropdownProps } from "react-day-picker"
import { id as localeId } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/**
 * Dropdown bulan/tahun memakai Select shadcn (Radix), bukan <select> native.
 * DayPicker mengharapkan handler ala <select>, jadi onValueChange dibungkus
 * menjadi ChangeEvent sintetis seperlunya.
 */
function SelectDropdown({ options, value, onChange, "aria-label": ariaLabel }: DropdownProps) {
  const selected = options?.find((o) => String(o.value) === String(value))

  function handleChange(next: string) {
    onChange?.({
      target: { value: next },
    } as React.ChangeEvent<HTMLSelectElement>)
  }

  return (
    <Select value={String(value ?? "")} onValueChange={handleChange}>
      <SelectTrigger
        aria-label={ariaLabel}
        className="h-8 w-auto gap-1 border-slate-200 px-2 text-sm font-medium focus:ring-blue-500"
      >
        <SelectValue>{selected?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {options?.map((opt) => (
          <SelectItem key={opt.value} value={String(opt.value)} disabled={opt.disabled}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * Kalender shadcn-style di atas react-day-picker v9.
 * Lokal Indonesia + dropdown bulan/tahun agar lompat tanggal jauh tetap cepat.
 */
function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={localeId}
      showOutsideDays={showOutsideDays}
      captionLayout="dropdown"
      className={cn("p-1", className)}
      classNames={{
        months: "flex flex-col gap-4",
        month: "space-y-3",
        month_caption: "flex items-center justify-center h-8",
        caption_label: "hidden",
        dropdowns: "flex items-center gap-1.5",
        dropdown_root: "relative",
        nav: "flex items-center justify-between absolute inset-x-1 top-1 z-10 pointer-events-none",
        button_previous:
          "pointer-events-auto inline-flex h-7 w-7 items-center justify-center rounded-md " +
          "text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30",
        button_next:
          "pointer-events-auto inline-flex h-7 w-7 items-center justify-center rounded-md " +
          "text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 text-[11px] font-medium uppercase tracking-wide text-slate-400",
        week: "flex w-full mt-1",
        day: "p-0",
        day_button:
          "h-9 w-9 rounded-lg text-sm font-normal text-slate-700 transition-colors " +
          "hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 " +
          "aria-selected:bg-blue-600 aria-selected:font-semibold aria-selected:text-white " +
          "aria-selected:hover:bg-blue-600",
        today: "font-semibold text-blue-600",
        outside: "text-slate-300",
        disabled: "text-slate-300 line-through hover:bg-transparent",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Dropdown: SelectDropdown,
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" {...rest} />
          ) : (
            <ChevronRight className="h-4 w-4" {...rest} />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
