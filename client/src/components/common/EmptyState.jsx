/**
 * @file src/components/common/EmptyState.jsx
 * @description Universal empty/zero-state UI component with customizable icon, title, description, and action buttons.
 */

import { HiOutlineSearch } from 'react-icons/hi';

const EmptyState = ({
  icon: Icon = HiOutlineSearch,
  title = 'No Data Found',
  description = 'There are no records matching your criteria.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center text-slate-500 space-y-4 animate-fade-in ${className}`}
    >
      {/* Icon with Gradient Ring */}
      <div className="relative">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 shadow-inner">
          <Icon className="w-8 h-8" />
        </div>
      </div>

      {/* Text Info */}
      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-2 pt-2 flex-wrap justify-center">
          {secondaryActionLabel && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {secondaryActionLabel}
            </button>
          )}

          {actionLabel && (
            <button
              type="button"
              onClick={onAction}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
