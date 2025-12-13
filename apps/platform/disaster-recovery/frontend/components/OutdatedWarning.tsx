"use client";

import { isDocumentOutdated, formatDateTime } from "@/lib/utils";
import { useToast } from "./ToastProvider";
import { useState } from "react";

interface OutdatedWarningProps {
  updatedAt: string;
  className?: string;
  onUpdate?: () => void;
  showActions?: boolean;
  dismissible?: boolean;
  variant?: 'inline' | 'banner' | 'compact';
}

export function OutdatedWarning({ 
  updatedAt, 
  className = "", 
  onUpdate,
  showActions = false,
  dismissible = false,
  variant = 'inline'
}: OutdatedWarningProps) {
  const { showOutdatedWarning } = useToast();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isDocumentOutdated(updatedAt) || isDismissed) {
    return null;
  }

  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleShowToast = () => {
    showOutdatedWarning(daysSinceUpdate);
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-orange-600 ${className}`}>
        <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">!</span>
        </div>
        <span className="text-sm">Outdated ({daysSinceUpdate}d ago)</span>
        <button
          onClick={handleShowToast}
          className="text-orange-600 hover:underline text-xs"
        >
          Details
        </button>
        {onUpdate && (
          <button
            onClick={onUpdate}
            className="text-orange-600 hover:underline text-xs"
          >
            Update
          </button>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-orange-100 border-t border-b border-orange-300 text-orange-800 px-4 py-2 ${className}`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <span className="text-sm font-medium">
              This document was last updated {daysSinceUpdate} days ago and may be outdated.
            </span>
          </div>
          <div className="flex items-center gap-3">
            {onUpdate && (
              <button
                onClick={onUpdate}
                className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors"
              >
                Update Now
              </button>
            )}
            {dismissible && (
              <button
                onClick={() => setIsDismissed(true)}
                className="text-orange-600 hover:text-orange-800 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default inline variant
  return (
    <div
      className={`bg-orange-50 border-l-4 border-orange-400 text-orange-700 px-4 py-3 rounded-r-lg shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-sm font-bold">!</span>
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-orange-800">Document may be outdated</p>
              <p className="text-sm text-orange-600 mt-1">
                Last updated {daysSinceUpdate} days ago ({formatDateTime(updatedAt)}). 
                Documents should be reviewed every 90 days to ensure accuracy.
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {showActions && onUpdate && (
                <button
                  onClick={onUpdate}
                  className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors flex-shrink-0"
                >
                  Update Now
                </button>
              )}
              {dismissible && (
                <button
                  onClick={() => setIsDismissed(true)}
                  className="text-orange-600 hover:text-orange-800 text-lg leading-none flex-shrink-0"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          
          {!showActions && (
            <div className="mt-2 text-xs text-orange-600">
              💡 Consider updating this document to ensure it reflects current procedures and contacts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
