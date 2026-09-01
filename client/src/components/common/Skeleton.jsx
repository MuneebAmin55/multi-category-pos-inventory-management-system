/**
 * @file src/components/common/Skeleton.jsx
 * @description Suite of animated shimmer skeleton loaders matching exact UI geometries to eliminate Cumulative Layout Shift (CLS).
 */

export const SkeletonBox = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200/80 rounded-xl ${className}`} />
);

/**
 * Skeleton for 4-column KPI Metric Cards
 */
export const StatCardSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3 animate-pulse"
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-slate-200" />
          <div className="w-16 h-5 rounded-full bg-slate-100" />
        </div>
        <div className="space-y-2">
          <div className="w-20 h-4 bg-slate-100 rounded" />
          <div className="w-32 h-7 bg-slate-200 rounded-lg" />
          <div className="w-24 h-3 bg-slate-100 rounded" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton for Data Tables
 */
export const TableSkeleton = ({ rows = 6, cols = 5 }) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-pulse">
    {/* Table Header */}
    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
      <div className="w-40 h-5 bg-slate-200 rounded" />
      <div className="w-24 h-4 bg-slate-200 rounded" />
    </div>

    {/* Rows */}
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-xl bg-slate-200 flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="w-1/3 h-4 bg-slate-200 rounded" />
              <div className="w-1/4 h-3 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="w-20 h-4 bg-slate-100 rounded hidden sm:block" />
          <div className="w-16 h-4 bg-slate-100 rounded hidden md:block" />
          <div className="w-20 h-5 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton for Touch Product Grids (POS and Catalog)
 */
export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 animate-pulse">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-3 rounded-2xl border border-slate-200/80 bg-white space-y-2.5">
        <div className="w-full aspect-video rounded-xl bg-slate-200" />
        <div className="space-y-1.5">
          <div className="w-3/4 h-4 bg-slate-200 rounded" />
          <div className="w-1/2 h-3 bg-slate-100 rounded" />
        </div>
        <div className="w-16 h-4 bg-slate-100 rounded-full" />
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="w-14 h-5 bg-slate-200 rounded" />
          <div className="w-16 h-3 bg-slate-100 rounded" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton for Charts & Analytics Cards
 */
export const ChartSkeleton = () => (
  <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-1.5">
        <div className="w-48 h-5 bg-slate-200 rounded" />
        <div className="w-64 h-3 bg-slate-100 rounded" />
      </div>
      <div className="w-24 h-6 bg-slate-100 rounded-lg" />
    </div>
    <div className="h-56 flex items-end justify-between gap-4 pt-6 px-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div
            style={{ height: `${20 + ((i * 37) % 70)}%` }}
            className="w-full max-w-[48px] bg-slate-200 rounded-xl"
          />
          <div className="w-10 h-3 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Full Page Route Loading Fallback Skeleton
 */
export const PageLoaderSkeleton = () => (
  <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
    {/* Page Header */}
    <div className="flex items-center justify-between animate-pulse">
      <div className="space-y-2">
        <div className="w-56 h-8 bg-slate-200 rounded-xl" />
        <div className="w-80 h-4 bg-slate-100 rounded-lg" />
      </div>
      <div className="w-28 h-10 bg-slate-200 rounded-xl" />
    </div>

    {/* Metric Cards */}
    <StatCardSkeleton count={4} />

    {/* Main Content Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ChartSkeleton />
      </div>
      <div className="bg-slate-900/10 rounded-2xl h-80 animate-pulse" />
    </div>
  </div>
);

export default {
  SkeletonBox,
  StatCardSkeleton,
  TableSkeleton,
  ProductGridSkeleton,
  ChartSkeleton,
  PageLoaderSkeleton,
};
