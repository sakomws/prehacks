"use client";

import { ValidationResult } from "@/types/document";
import { useState } from "react";

interface ValidationSummaryProps {
  validation: ValidationResult;
  onClose?: () => void;
  className?: string;
  collapsible?: boolean;
  showSuccessDetails?: boolean;
}

export function ValidationSummary({ 
  validation, 
  onClose, 
  className = "",
  collapsible = false,
  showSuccessDetails = false
}: ValidationSummaryProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const errorCount = validation.errors.length;
  const warningCount = validation.warnings.length;
  const hasIssues = errorCount > 0 || warningCount > 0;

  if (!hasIssues && !validation.valid && !showSuccessDetails) {
    return null;
  }

  const getSummaryText = () => {
    if (validation.valid && errorCount === 0) {
      return warningCount > 0 
        ? `Document is valid with ${warningCount} warning${warningCount !== 1 ? 's' : ''}`
        : "Document is valid and ready to use";
    }
    
    const parts = [];
    if (errorCount > 0) {
      parts.push(`${errorCount} error${errorCount !== 1 ? 's' : ''}`);
    }
    if (warningCount > 0) {
      parts.push(`${warningCount} warning${warningCount !== 1 ? 's' : ''}`);
    }
    return `Found ${parts.join(' and ')} that need attention`;
  };

  const getStatusColor = () => {
    if (validation.valid && errorCount === 0) {
      return warningCount > 0 ? "yellow" : "green";
    }
    return "red";
  };

  const statusColor = getStatusColor();
  const colorClasses = {
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      icon: "bg-green-500",
      button: "text-green-700 hover:text-green-900"
    },
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-200", 
      text: "text-yellow-700",
      icon: "bg-yellow-500",
      button: "text-yellow-700 hover:text-yellow-900"
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700", 
      icon: "bg-red-500",
      button: "text-red-700 hover:text-red-900"
    }
  };

  const colors = colorClasses[statusColor];
  const icon = statusColor === "green" ? "✓" : "!";

  return (
    <div className={`${colors.bg} border ${colors.border} ${colors.text} rounded-lg shadow-sm ${className}`}>
      <div className="px-4 py-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-6 h-6 ${colors.icon} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <span className="text-white text-sm font-bold">{icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{getSummaryText()}</h3>
                <div className="flex items-center gap-2">
                  {collapsible && hasIssues && (
                    <button
                      onClick={() => setIsCollapsed(!isCollapsed)}
                      className={`${colors.button} text-sm underline hover:no-underline`}
                    >
                      {isCollapsed ? 'Show details' : 'Hide details'}
                    </button>
                  )}
                  {onClose && (
                    <button 
                      onClick={onClose} 
                      className={`${colors.button} text-xl leading-none ml-2`}
                      aria-label="Close validation summary"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              
              {validation.valid && showSuccessDetails && (
                <p className="text-sm mt-1 opacity-90">
                  All required sections are complete and properly formatted.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Issues */}
        {hasIssues && !isCollapsed && (
          <div className="mt-4 space-y-3">
            {/* Errors */}
            {errorCount > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </span>
                  Errors ({errorCount})
                </h4>
                <div className="space-y-2 ml-6">
                  {validation.errors.map((err, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-red-100 rounded border border-red-300">
                      <span className="text-red-500 text-sm mt-0.5">●</span>
                      <div className="flex-1">
                        <span className="font-medium capitalize text-sm">
                          {err.field.replace(/_/g, ' ')}
                        </span>
                        <p className="text-sm mt-0.5">{err.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {warningCount > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <span className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">⚠</span>
                  </span>
                  Warnings ({warningCount})
                </h4>
                <div className="space-y-2 ml-6">
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
        )}
      </div>
    </div>
  );
}