import { cn } from "@/lib/utils";

interface TuranIconProps {
  className?: string;
  size?: number | string;
}

/**
 * Turan Standard Pool Icon
 * 4 arrows forming a dynamic pattern
 * Always orange (#F7931E) - brand color
 */
export function TuranIcon({ className, size = 24 }: TuranIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 130 130"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      fill="#F7931E"
    >
      <path d="M20.6,33.3l24.23,24.23c1.01,1.01,2.64,1.01,3.64,0l5.92-5.92c13.08-13.08,20.43-30.82,20.43-49.31V0H56.44v43.15L33.6,20.31l-13,13h0Z" />
      <path d="M109.13,96.45l-24.23-24.23c-1.01-1.01-2.64-1.01-3.64,0l-5.92,5.92c-13.08,13.08-20.43,30.82-20.43,49.31v2.29h18.38v-43.15l22.84,22.84,13-13v.02Z" />
      <path d="M96.44,20.61l-24.23,24.23c-1.01,1.01-1.01,2.64,0,3.64l5.92,5.92c13.08,13.08,30.82,20.43,49.31,20.43h2.29v-18.38h-43.15l22.84-22.84-13-13h.02Z" />
      <path d="M33.29,109.14l24.23-24.23c1.01-1.01,1.01-2.64,0-3.64l-5.92-5.92c-13.08-13.08-30.82-20.43-49.31-20.43H0v18.38h43.15l-22.84,22.84,13,13h-.02Z" />
    </svg>
  );
}
