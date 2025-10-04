interface SubtotalDisplayProps {
  label: string
  value: number
  formula?: string
  className?: string
  valueClassName?: string
}

export function SubtotalDisplay({
  label,
  value,
  formula,
  className = "bg-blue-50 p-4 rounded-lg",
  valueClassName = "bg-blue-200 px-3 py-1 rounded"
}: SubtotalDisplayProps) {
  // Handle NaN and undefined values
  const displayValue = isNaN(value) || value === undefined || value === null ? 0 : value;
  
  return (
    <div className={className}>
      <div className="flex justify-between items-center font-semibold">
        <span>{label}</span>
        <span className={valueClassName}>{displayValue}</span>
      </div>
      {formula && (
        <p className="text-sm text-blue-600 mt-1">({formula})</p>
      )}
    </div>
  )
}
