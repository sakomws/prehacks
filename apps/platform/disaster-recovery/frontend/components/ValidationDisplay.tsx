import { ValidationResult } from "@/types/document";

interface ValidationDisplayProps {
  validation: ValidationResult;
  onClose?: () => void;
  showSummary?: boolean;
}

export function ValidationDisplay({ validation, onClose, showSummary = true }: ValidationDisplayProps) {
  const errorCount = validation.errors.length;
  const warningCount = validation.warnings.length;

  return (
    <div className="space-y-4">
      {validation.valid ? (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <div>
              <span className="font-semibold">Document is valid</span>
              {showSummary && (
                <p className="text-sm text-green-600 mt-1">
                  All required sections are complete and properly formatted.
                </p>
              )}
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose} 
              className="text-green-700 hover:text-green-900 text-xl leading-none"
              aria-label="Close validation results"
            >
              ×
            </button>
          )}
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div>
                <h3 className="font-semibold">Validation Failed</h3>
                {showSummary && (
                  <p className="text-sm text-red-600">
                    Found {errorCount} error{errorCount !== 1 ? 's' : ''} that must be fixed.
                  </p>
                )}
              </div>
            </div>
            {onClose && (
              <button 
                onClick={onClose} 
                className="text-red-700 hover:text-red-900 text-xl leading-none"
                aria-label="Close validation results"
              >
                ×
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {validation.errors.map((err, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 bg-red-100 rounded border border-red-300">
                <span className="text-red-500 text-sm mt-0.5">●</span>
                <div className="flex-1">
                  <span className="font-medium capitalize">{err.field.replace(/_/g, ' ')}</span>
                  <p className="text-sm">{err.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <div>
              <h3 className="font-semibold">Warnings</h3>
              {showSummary && (
                <p className="text-sm text-yellow-600">
                  Found {warningCount} warning{warningCount !== 1 ? 's' : ''} that should be reviewed.
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            {validation.warnings.map((warn, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 bg-yellow-100 rounded border border-yellow-300">
                <span className="text-yellow-500 text-sm mt-0.5">●</span>
                <p className="text-sm flex-1">{warn}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
