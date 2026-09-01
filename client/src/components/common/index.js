/**
 * @file src/components/common/index.js
 * @description Central barrel export for common UI building blocks.
 */

export { default as Badge, CategoryBadge, StockBadge, RoleBadge } from './Badge';
export { default as Modal } from './Modal';
export { default as Pagination } from './Pagination';
export { default as SearchInput } from './SearchInput';
export { default as StatCard } from './StatCard';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as EmptyState } from './EmptyState';
export { default as ConfirmDialog } from './ConfirmDialog';
export {
  default as Skeleton,
  SkeletonBox,
  StatCardSkeleton,
  TableSkeleton,
  ProductGridSkeleton,
  ChartSkeleton,
  PageLoaderSkeleton,
} from './Skeleton';
