/**
 * BoundaryList - "What TSP Does NOT Do" Section Component
 *
 * Design: Institutional, explicit about limitations
 * - X icons for each boundary
 * - Muted gray styling
 * - No promotional language
 */

import { X } from 'lucide-react';

interface BoundaryListProps {
  items: string[];
  className?: string;
}

export function BoundaryList({ items, className = '' }: BoundaryListProps) {
  return (
    <ul className={`space-y-4 ${className}`}>
      {items.map((item, index) => (
        <li
          key={index}
          className="flex items-start gap-3 text-gray-600"
        >
          <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-none flex-shrink-0 mt-0.5">
            <X className="w-4 h-4 text-gray-400 stroke-[2]" />
          </div>
          <span className="text-base leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default BoundaryList;
