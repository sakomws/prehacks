"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
  title?: string;
  details?: string[];
}

export function Toast({ 
  message, 
  type, 
  onClose, 
  duration = 5000, 
  title,
  details 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Trigger animation
    setIsVisible(true);
    
    // Auto-close timer
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: "bg-green-50 border-green-200 text-green-700 border-l-green-500",
    error: "bg-red-50 border-red-200 text-red-700 border-l-red-500",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-700 border-l-yellow-500",
    info: "bg-blue-50 border-blue-200 text-blue-700 border-l-blue-500",
  };

  const iconStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-white",
    info: "bg-blue-500 text-white",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={`border-l-4 border px-4 py-3 rounded-r-lg shadow-lg min-w-[320px] max-w-md transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${styles[type]}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${iconStyles[type]}`}>
          <span className="text-sm font-bold">{icons[type]}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold text-sm mb-1">{title}</h4>
          )}
          <p className="text-sm break-words">{message}</p>
          
          {details && details.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs underline hover:no-underline"
              >
                {showDetails ? 'Hide details' : 'Show details'}
              </button>
              {showDetails && (
                <ul className="mt-1 text-xs space-y-1 pl-2 border-l-2 border-current opacity-75">
                  {details.map((detail, idx) => (
                    <li key={idx}>• {detail}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }} 
          className="text-lg hover:opacity-70 flex-shrink-0 leading-none"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
