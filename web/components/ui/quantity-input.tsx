"use client"

import { MinusIcon, PlusIcon } from "lucide-react"
import { useEffect, useId, useState } from "react"
import { FieldLabel } from "@/components/ui/field-label"
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

type QuantityInputProps = {
  id?: string
  label?: string
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
}

function clamp(value: number, min: number, max?: number) {
  if (max !== undefined) {
    return Math.min(max, Math.max(min, value))
  }
  return Math.max(min, value)
}

function QuantityInput({
  id,
  label = "Quantity",
  value,
  onValueChange,
  min = 1,
  max,
  disabled = false,
  className,
}: QuantityInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [inputValue, setInputValue] = useState(String(value))

  useEffect(() => {
    setInputValue(String(value))
  }, [value])

  const isValid = (parsed: number) =>
    Number.isInteger(parsed) &&
    parsed >= min &&
    (max === undefined || parsed <= max)

  const commit = (raw: string) => {
    const parsed = Number.parseInt(raw, 10)
    if (!isValid(parsed)) {
      setInputValue(String(value))
      return
    }
    onValueChange(parsed)
  }

  const updateValue = (nextValue: number) => {
    onValueChange(clamp(nextValue, min, max))
  }

  const canDecrease = !disabled && value > min
  const canIncrease = !disabled && (max === undefined || value < max)

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <InputGroup className="h-9">
        <InputGroupButton
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={!canDecrease}
          aria-label="Decrease quantity"
          onClick={() => updateValue(value - 1)}
        >
          <MinusIcon />
        </InputGroupButton>
        <InputGroupInput
          id={inputId}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={inputValue}
          disabled={disabled}
          className="text-center font-semibold tabular-nums"
          onChange={(event) => {
            const raw = event.target.value
            setInputValue(raw)

            if (raw === "") {
              return
            }

            const parsed = Number.parseInt(raw, 10)
            if (isValid(parsed)) {
              onValueChange(parsed)
            }
          }}
          onBlur={() => commit(inputValue)}
        />
        <InputGroupButton
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={!canIncrease}
          aria-label="Increase quantity"
          onClick={() => updateValue(value + 1)}
        >
          <PlusIcon />
        </InputGroupButton>
      </InputGroup>
    </div>
  )
}

export default QuantityInput
