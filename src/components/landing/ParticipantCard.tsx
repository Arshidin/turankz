/**
 * ParticipantCard - Institutional Participant Pathway Card
 *
 * Design: Blackstone/BRS inspired
 * - Sharp corners (border-radius: 0) - CRITICAL
 * - Subtle hover border effect
 * - No promotional language
 */

import { LucideIcon } from 'lucide-react';

interface ParticipantCardProps {
  title: string;
  subtitle: string;
  items: string[];
  cta: string;
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
}

export function ParticipantCard({
  title,
  subtitle,
  items,
  cta,
  href,
  onClick,
  icon: Icon,
}: ParticipantCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      window.location.href = href;
    }
  };

  return (
    <div
      className="group bg-white border border-gray-200 rounded-none p-6 lg:p-8 hover:border-gray-400 transition-all duration-200 cursor-pointer"
      onClick={handleClick}
    >
      {/* Icon */}
      <div className="w-12 h-12 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-none mb-6">
        <Icon className="w-6 h-6 text-gray-600 stroke-[1.5]" />
      </div>

      {/* Header */}
      <div className="mb-4">
        <h3 className="font-landing-heading text-xl lg:text-2xl font-semibold text-gray-900 mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-500 font-medium">
          {subtitle}
        </p>
      </div>

      {/* Items List */}
      <ul className="space-y-2 mb-6">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="flex items-center gap-2 text-sm font-medium text-[#2563EB] group-hover:text-[#1D4ED8] transition-colors">
        <span>{cta}</span>
        <svg
          className="w-4 h-4 group-hover:translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

export default ParticipantCard;
