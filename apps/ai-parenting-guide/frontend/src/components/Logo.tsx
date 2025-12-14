interface LogoProps {
  size?: "sm" | "md" | "lg" | number;
  className?: string;
}

export default function Logo({ size = "md", className = "" }: LogoProps) {
  const dimensions: Record<string, { width: number; height: number }> = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 40, height: 40 },
  };

  const { width, height } = typeof size === "number" 
    ? { width: size, height: size }
    : dimensions[size] || dimensions.md;

  return (
    <div
      className={`flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        borderRadius: '8px',
      }}
    >
      <span className="text-white font-bold text-xs" style={{ fontSize: `${width * 0.4}px` }}>
        AI
      </span>
    </div>
  );
}
