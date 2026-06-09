"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
}

export interface SelectFilter {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  allLabel?: string;
}

interface DataTableFilterProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  selects?: SelectFilter[];
  children?: React.ReactNode;
}

export function DataTableFilter({
  value,
  onChange,
  onKeyDown,
  placeholder = "Cari...",
  selects,
  children,
}: DataTableFilterProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {value && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => onChange("")}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {selects?.map((sel, i) => (
        <Select key={i} value={sel.value} onValueChange={sel.onChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={sel.placeholder ?? "Filter..."} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{sel.allLabel ?? "Semua"}</SelectItem>
            {sel.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {children}
    </div>
  );
}
