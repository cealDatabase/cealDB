import { Control, FieldPath, FieldValues } from "react-hook-form"
import { ReusableFormField, ReusableNumberFormField } from "../ReusableFormField"

interface LanguageField {
  name: string
  label: string
  disabled?: boolean
}

interface LanguageFieldGroupProps<T extends FieldValues> {
  control: Control<T>
  fields: {
    chinese: LanguageField
    japanese: LanguageField
    korean: LanguageField
    noncjk: LanguageField
  }
  useFloatNumbers?: boolean
  className?: string
}

export function LanguageFieldGroup<T extends FieldValues>({
  control,
  fields,
  useFloatNumbers = false,
  className = "grid grid-cols-1 md:grid-cols-2 gap-4"
}: LanguageFieldGroupProps<T>) {
  const FieldComponent = useFloatNumbers ? ReusableNumberFormField : ReusableFormField

  return (
    <div className={className}>
      <FieldComponent
        control={control}
        name={fields.chinese.name as FieldPath<T>}
        label={fields.chinese.label}
        type="number"
        disabled={fields.chinese.disabled}
        {...(useFloatNumbers && { useFloat: true })}
      />
      <FieldComponent
        control={control}
        name={fields.japanese.name as FieldPath<T>}
        label={fields.japanese.label}
        type="number"
        disabled={fields.japanese.disabled}
        {...(useFloatNumbers && { useFloat: true })}
      />
      <FieldComponent
        control={control}
        name={fields.korean.name as FieldPath<T>}
        label={fields.korean.label}
        type="number"
        disabled={fields.korean.disabled}
        {...(useFloatNumbers && { useFloat: true })}
      />
      <FieldComponent
        control={control}
        name={fields.noncjk.name as FieldPath<T>}
        label={fields.noncjk.label}
        type="number"
        disabled={fields.noncjk.disabled}
        {...(useFloatNumbers && { useFloat: true })}
      />
    </div>
  )
}
