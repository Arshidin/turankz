/**
 * PrincipleCard - Numbered Principles Component (01, 02, 03)
 *
 * Design: Institutional, numbered content for authority
 * Pattern from CLAUDE_CODE_INSTRUCTIONS_V2.md
 */

interface PrincipleCardProps {
  number: string;
  title: string;
  description: string;
  className?: string;
}

export function PrincipleCard({ number, title, description, className = '' }: PrincipleCardProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <span className="font-landing-heading text-3xl font-semibold text-[#2563EB]">
        {number}
      </span>
      <h4 className="text-base font-semibold text-gray-900">
        {title}
      </h4>
      <p className="text-sm text-[#4A5568] leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default PrincipleCard;
