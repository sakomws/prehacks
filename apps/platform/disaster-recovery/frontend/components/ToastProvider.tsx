"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Toast, ToastType } from "./Toast";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  title?: string;
  details?: string[];
  duration?: number;
}

interface ToastOptions {
  title?: string;
  details?: string[];
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, options?: ToastOptions) => void;
  showValidationToast: (errors: Array<{field: string, message: string}>, type?: ToastType) => void;
  showValidationSuccess: (message?: string) => void;
  showOutdatedWarning: (daysSinceUpdate: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [nextId, setNextId] = useState(0);

  const showToast = (message: string, type: ToastType, options?: ToastOptions) => {
    const id = nextId;
    setNextId(id + 1);
    setToasts((prev) => [...prev, { 
      id, 
      message, 
      type, 
      title: options?.title,
      details: options?.details,
      duration: options?.duration
    }]);
  };

  const showValidationToast = (errors: Array<{field: string, message: string}>, type: ToastType = 'error') => {
    const errorCount = errors.length;
    const message = `Found ${errorCount} validation error${errorCount !== 1 ? 's' : ''}`;
    const details = errors.map(err => `${err.field.replace(/_/g, ' ')}: ${err.message}`);
    
    showToast(message, type, {
      title: 'Validation Failed',
      details,
      duration: 8000 // Longer duration for validation errors
    });
  };

  const showValidationSuccess = (message = "All validation checks passed") => {
    showToast(message, 'success', {
      title: 'Validation Complete',
      duration: 4000
    });
  };

  const showOutdatedWarning = (daysSinceUpdate: number) => {
    showToast(
      `This document was last updated ${daysSinceUpdate} days ago`, 
      'warning', 
      {
        title: 'Document May Be Outdated',
        details: ['Documents should be reviewed every 90 days', 'Consider updating to ensure accuracy'],
        duration: 10000
      }
    );
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, showValidationToast, showValidationSuccess, showOutdatedWarning }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            title={toast.title}
            details={toast.details}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
