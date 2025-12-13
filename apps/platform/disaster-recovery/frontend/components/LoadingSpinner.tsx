interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ message, size = "md" }: LoadingSpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`inline-block animate-spin rounded-full border-b-2 border-blue-600 ${sizes[size]}`}
      ></div>
      {message && <p className="mt-2 text-gray-600">{message}</p>}
    </div>
  );
}
