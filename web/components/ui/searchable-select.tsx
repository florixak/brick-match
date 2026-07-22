"use client"

import { useMemo } from "react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { cn } from "@/lib/utils"

export type SearchableSelectOption<T extends string | number> = {
  value: T
  label: string
}

type SearchableSelectProps<T extends string | number> = {
  id?: string
  label: string
  placeholder?: string
  emptyMessage?: string
  value: T | null
  onValueChange: (value: T | null) => void
  options: SearchableSelectOption<T>[]
  disabled?: boolean
  isLoading?: boolean
  className?: string
  triggerClassName?: string
}

const labelClassName =
  "text-xs font-black uppercase tracking-wide text-muted-foreground"

function SearchableSelect<T extends string | number>({
  id,
  label,
  placeholder = "Search…",
  emptyMessage = "No results found.",
  value,
  onValueChange,
  options,
  disabled = false,
  isLoading = false,
  className,
  triggerClassName,
}: SearchableSelectProps<T>) {
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  )

  const isDisabled = disabled || isLoading

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <Combobox
        items={options}
        itemToStringValue={(option) => option.label}
        value={selectedOption}
        onValueChange={(option) => onValueChange(option?.value ?? null)}
        disabled={isDisabled}
      >
        <ComboboxInput
          id={id}
          placeholder={isLoading ? "Loading…" : placeholder}
          showClear
          disabled={isDisabled}
          className={cn("h-9 w-full font-semibold", triggerClassName)}
        />
        <ComboboxContent>
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          <ComboboxList>
            {(option) => (
              <ComboboxItem key={String(option.value)} value={option}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}

export default SearchableSelect
