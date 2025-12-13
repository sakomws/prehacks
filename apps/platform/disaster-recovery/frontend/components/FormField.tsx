import { ReactNode } from "react";
import { InlineValidation } from "./InlineValidation";

interface FormFieldProps {
  label: string;
  error?: string;
  warning?: string;
  success?: string;
  info?: string;
  required?: boolean;
  children: ReactNode;
  helpText?: string;
  isValidating?: boolean;
  className?: string;
}

export function FormField({ 
  label, 
  error, 
  warning,
  success,
  info,
  required, 
  children, 
  helpText,
  isValidating = false,
  className = ""
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {helpText && !error && !warning && !success && !info && (
        <p className="text-gray-500 text-xs mt-1">{helpText}</p>
      )}
      <InlineValidation 
        error={error}
        warning={warning}
        success={success}
        info={info}
        isValidating={isValidating}
      />
    </div>
  );
}
