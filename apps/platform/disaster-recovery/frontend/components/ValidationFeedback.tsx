"use client";

import { useState, useEffect } from "react";
import { InlineValidation } from "./InlineValidation";

interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
  type: 'error' | 'warning' | 'info';
}

interface ValidationFeedbackProps {
  value: any;
  rules: ValidationRule[];
  className?: string;
  showSuccess?: boolean;
  successMessage?: string;
  debounceMs?: number;
}

export function ValidationFeedback({
  value,
  rules,
  className = "",
  showSuccess = true,
  successMessage = "Looks good!",
  debounceMs = 300
}: ValidationFeedbackProps) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setIsValidating(true);
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsValidating(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs]);

  // Don't show validation for empty values unless it's an error rule
  if (!debouncedValue && typeof debouncedValue !== 'number') {
    return null;
  }

  // Find the first failing rule
  for (const rule of rules) {
    if (!rule.test(debouncedValue)) {
      const props = {
        [rule.type]: rule.message,
        className,
        isValidating
      };
      return <InlineValidation {...props} />;
    }
  }

  // All rules passed - show success if enabled
  if (showSuccess && debouncedValue) {
    return (
      <InlineValidation 
        success={successMessage} 
        className={className}
        isValidating={isValidating}
      />
    );
  }

  return null;
}

// Common validation rules
export const ValidationRules = {
  required: (message = "This field is required"): ValidationRule => ({
    test: (value) => value !== null && value !== undefined && String(value).trim() !== "",
    message,
    type: 'error'
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => String(value).length >= min,
    message: message || `Must be at least ${min} characters`,
    type: 'error'
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value) => String(value).length <= max,
    message: message || `Must be no more than ${max} characters`,
    type: 'error'
  }),

  email: (message = "Please enter a valid email address"): ValidationRule => ({
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)),
    message,
    type: 'error'
  }),

  phone: (message = "Please enter a valid phone number"): ValidationRule => ({
    test: (value) => /^[\+]?[1-9][\d]{0,15}$/.test(String(value).replace(/[\s\-\(\)]/g, '')),
    message,
    type: 'error'
  }),

  positiveNumber: (message = "Must be a positive number"): ValidationRule => ({
    test: (value) => Number(value) > 0,
    message,
    type: 'error'
  }),

  minValue: (min: number, message?: string): ValidationRule => ({
    test: (value) => Number(value) >= min,
    message: message || `Must be at least ${min}`,
    type: 'error'
  }),

  maxValue: (max: number, message?: string): ValidationRule => ({
    test: (value) => Number(value) <= max,
    message: message || `Must be no more than ${max}`,
    type: 'error'
  }),

  // Warning rules
  recommendedMinLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => String(value).length >= min,
    message: message || `Consider adding more detail (recommended: ${min}+ characters)`,
    type: 'warning'
  }),

  // Info rules
  characterCount: (current: number, max?: number): ValidationRule => ({
    test: () => true,
    message: max ? `${current}/${max} characters` : `${current} characters`,
    type: 'info'
  })
};