import { ValidationResult } from "@/types/document";

interface ValidationStatusProps {
  validation?: ValidationResult;
  isValidating?: boolean;
  className?: string;
  compact?: boolean;
}

export function ValidationStatus({ 
  validation, 
  isValidating = false, 
  className = "",
  compact = false 
}: ValidationStatusProps) {
  if (isValidating) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-blue-600 text-sm">Validating...</span>
      </div>
    );
  }

  if (!validation) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
        <span className="text-sm">Not validated</span>
      </div>
    );
  }

  const errorCount = validation.errors.length;
  const warningCount = validation.warnings.length;

  if (validation.valid) {
    return (
      <div className={`flex items-center gap-2 text-green-600 ${className}`}>
        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">✓</span>
        </div>
        <span className="text-sm font-medium">
          {compact ? "Valid" : "Document is valid"}
        </span>
        {warningCount > 0 && !compact && (
          <span className="text-yellow-600 text-xs">
            ({warningCount} warning{warningCount !== 1 ? 's' : ''})
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-red-600 ${className}`}>
      <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">!</span>
      </div>
      <span className="text-sm font-medium">
        {compact 
          ? `${errorCount} error${errorCount !== 1 ? 's' : ''}` 
          : `${errorCount} validation error${errorCount !== 1 ? 's' : ''}`
        }
      </span>
      {warningCount > 0 && (
        <span className="text-yellow-600 text-xs">
          {warningCount} warning{warningCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}