import { ReactNode } from 'react';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * MainLayout - Design System Specification
 *
 * Two-column layout:
 * - Fixed sidebar: 260px width
 * - Fluid content: Remaining space
 *
 * Content area:
 * - Padding: 24px
 * - Background: bg-base (#0D0D0D)
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-[var(--bg-base)] overflow-hidden">
      {/* Sticky Header */}
      <TopNav />

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Sidebar - 260px width per design system */}
        <Sidebar />

        {/* Scrollable Main Content - 24px padding per design system */}
        <main className="flex-1 overflow-y-auto p-[24px]">
          {children}
        </main>
      </div>
    </div>
  );
}
