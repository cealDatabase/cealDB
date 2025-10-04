import React from "react"
import { Control, FieldPath, FieldValues } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ReusableFormFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  type: "number" | "string" | "textarea"
  placeholder?: string
  disabled?: boolean
  min?: string
  className?: string
}

export function ReusableFormField<T extends FieldValues>({
  control,
  name,
  label,
  type,
  placeholder = "0",
  disabled = false,
  min,
  className
}: ReusableFormFieldProps<T>) {
  if (type === "textarea") {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className={className}>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={placeholder}
                className="min-h-[100px]"
                disabled={disabled}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  if (type === "number") {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className={className}>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={min || "0"}
                placeholder={placeholder}
                disabled={disabled}
                {...field}
                value={field.value ?? 0}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                  field.onChange(value)
                }}
                onFocus={(e) => {
                  if (e.target.value === '0') {
                    e.target.select()
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  // Default to string type
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={placeholder}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Additional component for number fields that need parseFloat instead of parseInt
export function ReusableNumberFormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "0",
  disabled = false,
  min,
  className,
  useFloat = false
}: ReusableFormFieldProps<T> & { useFloat?: boolean }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              min={min || "0"}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              value={field.value ?? 0}
              onChange={(e) => {
                const value = useFloat 
                  ? (parseFloat(e.target.value) || 0)
                  : (parseInt(e.target.value) || 0)
                field.onChange(value)
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
