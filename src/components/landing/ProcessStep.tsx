/**
 * ProcessStep - Numbered Process Steps Component
 *
 * Design: Circular numbered badge with vertical flow
 * Pattern from CLAUDE_CODE_INSTRUCTIONS_V2.md
 */

interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
  className?: string;
}

export function ProcessStep({ number, title, description, className = '' }: ProcessStepProps) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Circular badge */}
      <div className="w-14 h-14 rounded-full bg-white border-2 border-[#E2E8F0] flex items-center justify-center font-landing-heading text-xl font-semibold text-[#2563EB]">
        {number}
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold mt-4 text-gray-900">
        {title}
      </h4>

      {/* Description */}
      <p className="text-xs text-[#718096] mt-1 leading-relaxed max-w-[140px]">
        {description}
      </p>
    </div>
  );
}

export default ProcessStep;
