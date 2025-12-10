import { Control, FieldPath, FieldValues } from "react-hook-form"
import { ReusableFormField, ReusableNumberFormField, ReusableCurrencyFormField } from "../ReusableFormField"

interface LanguageField {
  name: string
  label: string
  disabled?: boolean
}

interface LanguageFieldGroupProps<T extends FieldValues> {
  control: Control<T>
  fields: {
    chinese?: LanguageField
    japanese?: LanguageField
    korean?: LanguageField
    noncjk?: LanguageField
    eastasian?: LanguageField
    others?: LanguageField
  }
  useFloatNumbers?: boolean
  useCurrency?: boolean
  className?: string
  singleField?: boolean
}

export function LanguageFieldGroup<T extends FieldValues>({
  control,
  fields,
  useFloatNumbers = false,
  useCurrency = false,
  className = "grid grid-cols-1 md:grid-cols-2 gap-4",
  singleField = false
}: LanguageFieldGroupProps<T>) {
  const renderField = (field: LanguageField) => {
    if (useCurrency) {
      return (
        <ReusableCurrencyFormField
          control={control}
          name={field.name as FieldPath<T>}
          label={field.label}
          placeholder="0.00"
          disabled={field.disabled}
        />
      )
    }
    
    if (useFloatNumbers) {
      return (
        <ReusableNumberFormField
          control={control}
          name={field.name as FieldPath<T>}
          label={field.label}
          type="number"
          disabled={field.disabled}
          useFloat={true}
        />
      )
    }
    
    return (
      <ReusableFormField
        control={control}
        name={field.name as FieldPath<T>}
        label={field.label}
        type="number"
        disabled={field.disabled}
      />
    )
  }

  return (
    <div className={className}>
      {fields.chinese && renderField(fields.chinese)}
      {fields.japanese && renderField(fields.japanese)}
      {fields.korean && renderField(fields.korean)}
      {fields.noncjk && renderField(fields.noncjk)}
      {fields.eastasian && renderField(fields.eastasian)}
      {fields.others && renderField(fields.others)}
    </div>
  )
}
