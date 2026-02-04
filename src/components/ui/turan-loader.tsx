import { cn } from "@/lib/utils";
import "./turan-loader.css";

type LoaderVariant = "pulse" | "rotate" | "sequential";
type LoaderSize = "sm" | "md" | "lg";

interface TuranLoaderProps {
  variant?: LoaderVariant;
  size?: LoaderSize;
  fullscreen?: boolean;
  label?: string;
  showBar?: boolean;
  className?: string;
}

const SIZES = { sm: 24, md: 48, lg: 80 };

const TuranIcon = () => (
  <svg viewBox="33 -9 148 148" xmlns="http://www.w3.org/2000/svg">
    <path className="turan-lp" d="M63.62,33.3l24.23,24.23c1.01,1.01,2.64,1.01,3.64,0l5.92-5.92c13.08-13.08,20.43-30.82,20.43-49.31V0h-18.38v43.15l-22.84-22.84-13,13h0Z"/>
    <path className="turan-lp" d="M152.15,96.45l-24.23-24.23c-1.01-1.01-2.64-1.01-3.64,0l-5.92,5.92c-13.08,13.08-20.43,30.82-20.43,49.31v2.29h18.38v-43.15l22.84,22.84,13-13v.02Z"/>
    <path className="turan-lp" d="M139.46,20.61l-24.23,24.23c-1.01,1.01-1.01,2.64,0,3.64l5.92,5.92c13.08,13.08,30.82,20.43,49.31,20.43h2.29v-18.38h-43.15l22.84-22.84-13-13h.02Z"/>
    <path className="turan-lp" d="M76.31,109.14l24.23-24.23c1.01-1.01,1.01-2.64,0-3.64l-5.92-5.92c-13.08-13.08-30.82-20.43-49.31-20.43h-2.29v18.38h43.15l-22.84,22.84,13,13h-.02Z"/>
  </svg>
);

export function TuranLoader({
  variant = "sequential",
  size = "md",
  fullscreen = false,
  label,
  showBar = false,
  className,
}: TuranLoaderProps) {
  const px = SIZES[size];

  return (
    <div
      className={cn(
        "turan-loader",
        `turan-loader--${variant}`,
        fullscreen && "turan-loader--fullscreen",
        className
      )}
      role="status"
      aria-label={label || "Loading"}
    >
      <div
        className="turan-loader__icon"
        style={{ width: px, height: px }}
      >
        <TuranIcon />
      </div>

      {showBar && (
        <div className="turan-loader__bar">
          <div className="turan-loader__bar-inner" />
        </div>
      )}

      {label && (
        <span className="turan-loader__label">
          {label}
        </span>
      )}
    </div>
  );
}
