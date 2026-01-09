/**
 * VirtualizedList Component
 *
 * Sprint 11-12: High-performance virtualized list for large data sets.
 * Only renders visible items, improving scroll performance significantly.
 *
 * Features:
 * - Window-based virtualization (only visible items rendered)
 * - Dynamic row heights support
 * - Overscan for smooth scrolling
 * - Empty state handling
 * - Loading state
 *
 * Usage:
 * ```tsx
 * <VirtualizedList
 *   items={batches}
 *   itemHeight={80}
 *   renderItem={(batch, index) => <BatchRow batch={batch} />}
 *   emptyMessage="Нет партий"
 * />
 * ```
 */

import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface VirtualizedListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Height of each item in pixels (or function for dynamic heights) */
  itemHeight: number | ((item: T, index: number) => number);
  /** Render function for each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Maximum height of the container. Defaults to 600px */
  containerHeight?: number;
  /** Number of items to render outside visible area. Defaults to 3 */
  overscan?: number;
  /** Key extractor for React keys */
  keyExtractor?: (item: T, index: number) => string | number;
  /** Empty state message */
  emptyMessage?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Additional className for container */
  className?: string;
  /** Called when scrolled to bottom (for infinite loading) */
  onEndReached?: () => void;
  /** Threshold for onEndReached (in pixels from bottom). Defaults to 100 */
  endReachedThreshold?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  containerHeight = 600,
  overscan = 3,
  keyExtractor,
  emptyMessage = 'Нет данных',
  isLoading = false,
  className,
  onEndReached,
  endReachedThreshold = 100,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate item heights
  const getItemHeight = useCallback(
    (item: T, index: number): number => {
      return typeof itemHeight === 'function' ? itemHeight(item, index) : itemHeight;
    },
    [itemHeight]
  );

  // Calculate total height
  const totalHeight = items.reduce((sum, item, index) => sum + getItemHeight(item, index), 0);

  // Calculate visible range
  const getVisibleRange = useCallback(() => {
    if (items.length === 0) return { start: 0, end: 0 };

    let accumulatedHeight = 0;
    let startIndex = 0;
    let endIndex = items.length;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(items[i], i);
      if (accumulatedHeight + height > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
      accumulatedHeight += height;
    }

    // Find end index
    accumulatedHeight = 0;
    for (let i = 0; i < items.length; i++) {
      accumulatedHeight += getItemHeight(items[i], i);
      if (accumulatedHeight > scrollTop + containerHeight) {
        endIndex = Math.min(items.length, i + 1 + overscan);
        break;
      }
    }

    return { start: startIndex, end: endIndex };
  }, [items, scrollTop, containerHeight, overscan, getItemHeight]);

  // Calculate offset for visible items
  const getOffsetForIndex = useCallback(
    (index: number): number => {
      let offset = 0;
      for (let i = 0; i < index && i < items.length; i++) {
        offset += getItemHeight(items[i], i);
      }
      return offset;
    },
    [items, getItemHeight]
  );

  // Handle scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      setScrollTop(target.scrollTop);

      // Check if near bottom for infinite loading
      if (onEndReached) {
        const distanceFromBottom =
          target.scrollHeight - target.scrollTop - target.clientHeight;
        if (distanceFromBottom < endReachedThreshold) {
          onEndReached();
        }
      }
    },
    [onEndReached, endReachedThreshold]
  );

  // Get visible items
  const { start, end } = getVisibleRange();
  const visibleItems = items.slice(start, end);
  const offsetY = getOffsetForIndex(start);

  // Default key extractor
  const getKey = keyExtractor || ((_, index) => index);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center border rounded-lg bg-muted/30',
          className
        )}
        style={{ height: containerHeight }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="h-6 w-6 border-2 border-t-primary border-muted-foreground/30 rounded-full animate-spin" />
          <span className="text-sm">Загрузка...</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center border rounded-lg bg-muted/30',
          className
        )}
        style={{ height: Math.min(containerHeight, 200) }}
      >
        <span className="text-sm text-muted-foreground">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto border rounded-lg', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Spacer for total content height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, relativeIndex) => {
            const actualIndex = start + relativeIndex;
            return (
              <div
                key={getKey(item, actualIndex)}
                style={{ height: getItemHeight(item, actualIndex) }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// VIRTUALIZED TABLE
// ============================================================================

interface VirtualizedTableProps<T> {
  /** Array of items to render */
  items: T[];
  /** Row height in pixels */
  rowHeight?: number;
  /** Table columns configuration */
  columns: Array<{
    key: string;
    header: string;
    width?: string | number;
    render: (item: T, index: number) => ReactNode;
  }>;
  /** Maximum height of the table body */
  containerHeight?: number;
  /** Key extractor */
  keyExtractor?: (item: T, index: number) => string | number;
  /** Empty message */
  emptyMessage?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Additional className */
  className?: string;
}

export function VirtualizedTable<T>({
  items,
  rowHeight = 48,
  columns,
  containerHeight = 500,
  keyExtractor,
  emptyMessage = 'Нет данных',
  isLoading = false,
  className,
}: VirtualizedTableProps<T>) {
  const getKey = keyExtractor || ((_, index) => index);

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="flex bg-muted/50 border-b font-medium text-sm">
        {columns.map((col) => (
          <div
            key={col.key}
            className="px-4 py-3"
            style={{ width: col.width || 'auto', flex: col.width ? 'none' : 1 }}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* Virtualized body */}
      <VirtualizedList
        items={items}
        itemHeight={rowHeight}
        containerHeight={containerHeight}
        emptyMessage={emptyMessage}
        isLoading={isLoading}
        keyExtractor={getKey}
        className="border-none rounded-none"
        renderItem={(item, index) => (
          <div className="flex items-center border-b hover:bg-muted/30 transition-colors">
            {columns.map((col) => (
              <div
                key={col.key}
                className="px-4 py-2"
                style={{ width: col.width || 'auto', flex: col.width ? 'none' : 1 }}
              >
                {col.render(item, index)}
              </div>
            ))}
          </div>
        )}
      />
    </div>
  );
}
