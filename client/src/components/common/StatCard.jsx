/**
 * @file src/components/common/StatCard.jsx
 * @description Modern dashboard statistic card with gradient icons and trend indicators.
 */

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = 'from-blue-500 to-indigo-600',
  badgeText,
  badgeColor = 'bg-blue-50 text-blue-700 border-blue-100',
  trend,
  trendPositive = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-blue-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-xs sm:text-sm font-medium text-slate-500 truncate mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </h3>

          {(subtitle || trend) && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {trend && (
                <span
                  className={`inline-flex items-center text-xs font-semibold ${
                    trendPositive ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {trendPositive ? '↑' : '↓'} {trend}
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-slate-400 font-medium truncate">{subtitle}</span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${iconBg} flex items-center justify-center text-white shadow-md flex-shrink-0`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {badgeText && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badgeColor}`}
          >
            {badgeText}
          </span>
          <span className="text-[11px] text-slate-400">Real-time sync</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
