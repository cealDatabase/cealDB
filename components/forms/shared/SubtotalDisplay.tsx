interface SubtotalDisplayProps {
  label: string
  value: number
  formula?: string
  className?: string
  valueClassName?: string
  isCurrency?: boolean
}

export function SubtotalDisplay({
  label,
  value,
  formula,
  className = "bg-blue-50 p-4 rounded-lg",
  valueClassName = "bg-blue-200 px-3 py-1 rounded",
  isCurrency = false
}: SubtotalDisplayProps) {
  // Handle NaN and undefined values
  const rawValue = isNaN(value) || value === undefined || value === null ? 0 : value;
  
  // Format number to max 4 decimal places, removing trailing zeros
  const formatNumber = (num: number): string => {
    if (isCurrency) {
      // For currency, always show 2 decimal places
      return num.toFixed(2);
    }
    // Round to 4 decimal places to fix floating point precision
    const rounded = Math.round(num * 10000) / 10000;
    // Convert to string with up to 4 decimals, then remove trailing zeros
    return rounded.toFixed(4).replace(/\.?0+$/, '');
  };
  
  const displayValue = isCurrency ? `$${formatNumber(rawValue)}` : formatNumber(rawValue);
  
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
