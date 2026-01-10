/**
 * BoundaryCard - "What TSP Does NOT Do" Card Component
 *
 * Design: Dark background, explicit about limitations
 * Pattern from CLAUDE_CODE_INSTRUCTIONS_V2.md
 * - Decorative line at top
 * - Icon in muted white
 * - Sharp text contrast
 */

import { LucideIcon } from 'lucide-react';

interface BoundaryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function BoundaryCard({ icon: Icon, title, description, className = '' }: BoundaryCardProps) {
  return (
    <div className={`bg-[#0A0A0A] p-8 ${className}`}>
      {/* Decorative line */}
      <div className="w-6 h-0.5 bg-white/20 mb-6" />

      {/* Icon */}
      <Icon className="w-8 h-8 text-white/30 mb-4" />

      {/* Title */}
      <h4 className="font-landing-heading text-xl text-white mb-3">
        {title}
      </h4>

      {/* Description */}
      <p className="text-sm text-white/50 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default BoundaryCard;
