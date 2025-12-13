interface InlineValidationProps {
  error?: string;
  warning?: string;
  success?: string;
  info?: string;
  isValidating?: boolean;
  className?: string;
  showIcon?: boolean;
}

export function InlineValidation({ 
  error, 
  warning, 
  success, 
  info,
  isValidating = false,
  className = "",
  showIcon = true
}: InlineValidationProps) {
  if (isValidating) {
    return (
      <div className={`flex items-center gap-2 mt-1 ${className}`}>
        <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-600 text-sm">Validating...</p>
      </div>
    );
  }

  if (!error && !warning && !success && !info) {
    return null;
  }

  if (error) {
    return (
      <div className={`flex items-start gap-2 mt-1 ${className}`}>
        {showIcon && <span className="text-red-500 text-sm mt-0.5">●</span>}
        <p className="text-red-600 text-sm flex-1">{error}</p>
      </div>
    );
  }

  if (warning) {
    return (
      <div className={`flex items-start gap-2 mt-1 ${className}`}>
        {showIcon && <span className="text-yellow-500 text-sm mt-0.5">⚠</span>}
        <p className="text-yellow-600 text-sm flex-1">{warning}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className={`flex items-start gap-2 mt-1 ${className}`}>
        {showIcon && <span className="text-green-500 text-sm mt-0.5">✓</span>}
        <p className="text-green-600 text-sm flex-1">{success}</p>
      </div>
    );
  }

  if (info) {
    return (
      <div className={`flex items-start gap-2 mt-1 ${className}`}>
        {showIcon && <span className="text-blue-500 text-sm mt-0.5">ℹ</span>}
        <p className="text-blue-600 text-sm flex-1">{info}</p>
      </div>
    );
  }

  return null;
}