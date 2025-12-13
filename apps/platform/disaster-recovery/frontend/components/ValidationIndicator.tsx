"use client";

import { ValidationResult } from "@/types/document";
import { useState } from "react";
import { ValidationSummary } from "./ValidationSummary";

interface ValidationIndicatorProps {
  validation?: ValidationResult;
  isValidating?: boolean;
  onValidate?: () => void;
  className?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ValidationIndicator({ 
  validation, 
  isValidating = false,
  onValidate,
  className = "",
  showDetails = false,
  size = 'md'
}: ValidationIndicatorProps) {
  const [showSummary, setShowSummary] = useState(showDetails);

  const sizeClasses = {
    sm: "w-4 h-4 text-xs",
    md: "w-5 h-5 text-sm", 
    lg: "w-6 h-6 text-base"
  };

  const iconSize = sizeClasses[size];

  if (isValidating) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`border-2 border-blue-500 border-t-transparent rounded-full animate-spin ${iconSize}`}></div>
        <span className="text-blue-600 text-sm">Validating...</span>
      </div>
    );
  }

  if (!validation) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`border-2 border-gray-300 rounded-full ${iconSize}`}></div>
        <span className="text-gray-500 text-sm">Not validated</span>
        {onValidate && (
          <button
            onClick={onValidate}
            className="text-blue-600 hover:underline text-sm ml-2"
          >
            Validate now
          </button>
        )}
      </div>
    );
  }

  const errorCount = validation.errors.length;
  const warningCount = validation.warnings.length;
  const hasErrors = errorCount > 0;
  const hasWarnings = warningCount > 0;

  const getStatusInfo = () => {
    if (hasErrors) {
      return {
        color: "red",
        icon: "!",
        text: `${errorCount} error${errorCount !== 1 ? 's' : ''}`,
        bgColor: "bg-red-500",
        textColor: "text-red-600"
      };
    }
    
    if (hasWarnings) {
      return {
        color: "yellow", 
        icon: "⚠",
        text: `Valid with ${warningCount} warning${warningCount !== 1 ? 's' : ''}`,
        bgColor: "bg-yellow-500",
        textColor: "text-yellow-600"
      };
    }

    return {
      color: "green",
      icon: "✓", 
      text: "Valid",
      bgColor: "bg-green-500",
      textColor: "text-green-600"
    };
  };

  const status = getStatusInfo();

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <div className={`${status.bgColor} rounded-full flex items-center justify-center text-white font-bold ${iconSize}`}>
          <span>{status.icon}</span>
        </div>
        <span className={`${status.textColor} text-sm font-medium`}>
          {status.text}
        </span>
        {(hasErrors || hasWarnings) && (
          <button
            onClick={() => setShowSummary(!showSummary)}
            className={`${status.textColor} hover:underline text-sm`}
          >
            {showSummary ? 'Hide details' : 'Show details'}
          </button>
        )}
        {onValidate && (
          <button
            onClick={onValidate}
            className="text-blue-600 hover:underline text-sm ml-2"
          >
            Re-validate
          </button>
        )}
      </div>

      {showSummary && validation && (
        <div className="mt-3">
          <ValidationSummary 
            validation={validation}
            onClose={() => setShowSummary(false)}
            collapsible={false}
          />
        </div>
      )}
    </div>
  );
}