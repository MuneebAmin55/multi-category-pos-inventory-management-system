/**
 * @file src/pages/ReportsPage.jsx
 * @description Executive Business Intelligence & Analytics Suite:
 *   - Dashboard Analytics (KPIs, 7-Day Revenue Trend Chart)
 *   - Today's Sales Breakdown (Payment methods, Cashiers, Line items)
 *   - Inventory & Category Health (Share bars, Cold Chain Expiry timeline)
 *   - Low-Stock & Deficit Audit
 *   - Top-Selling Products Leaderboard (Multi-period filters)
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchAdminSummaryThunk,
  fetchTodaysSalesReportThunk,
  fetchLowStockReportThunk,
  fetchTopProductsThunk,
  fetchInventoryStatsThunk,
  setActiveReportTab,
  setTopProductsPeriod,
  selectReportsState,
} from '@/features/reports/reportsSlice';
import StatCard from '@/components/common/StatCard';
import { CategoryBadge, StockBadge } from '@/components/common/Badge';
import { CATEGORIES } from '@/constants/categories';
import {
  HiOutlineChartBar,
  HiOutlineCurrencyDollar,
  HiOutlineCube,
  HiOutlineExclamationCircle,
  HiOutlineTrendingUp,
  HiOutlineRefresh,
  HiOutlineClock,
  HiOutlineCreditCard,
  HiOutlineCash,
  HiOutlineDeviceMobile,
  HiOutlineUsers,
  HiOutlinePrinter,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineShoppingCart,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

const TAB_CONFIG = [
  { id: 'dashboard_analytics', label: 'Dashboard Analytics', icon: HiOutlineChartBar },
  { id: 'sales_report', label: "Today's Sales Breakdown", icon: HiOutlineCurrencyDollar },
  { id: 'inventory_report', label: 'Inventory & Category Health', icon: HiOutlineCube },
  { id: 'low_stock', label: 'Low Stock Deficit Audit', icon: HiOutlineExclamationCircle },
  { id: 'top_products', label: 'Top-Selling Leaderboard', icon: HiOutlineTrendingUp },
];

const PERIOD_CONFIG = [
  { id: 'today', label: 'Today' },
  { id: '7days', label: 'Last 7 Days' },
  { id: '30days', label: 'Last 30 Days' },
  { id: 'all', label: 'All-Time Lifetime' },
];

const ReportsPage = () => {
  const dispatch = useDispatch();
  const {
    adminSummary,
    todaysSales,
    lowStockReport,
    topProducts,
    inventoryStats,
    activeReportTab,
    topProductsPeriod,
    isLoading,
  } = useSelector(selectReportsState);

  // Load active tab data
  const loadDataForTab = (tab = activeReportTab, period = topProductsPeriod) => {
    if (tab === 'dashboard_analytics') {
      dispatch(fetchAdminSummaryThunk());
    } else if (tab === 'sales_report') {
      dispatch(fetchTodaysSalesReportThunk());
    } else if (tab === 'inventory_report') {
      dispatch(fetchInventoryStatsThunk());
    } else if (tab === 'low_stock') {
      dispatch(fetchLowStockReportThunk());
    } else if (tab === 'top_products') {
      dispatch(fetchTopProductsThunk({ period, limit: 20 }));
    }
  };

  useEffect(() => {
    loadDataForTab(activeReportTab, topProductsPeriod);
  }, [dispatch, activeReportTab, topProductsPeriod]);

  const handleTabChange = (tabId) => {
    dispatch(setActiveReportTab(tabId));
  };

  const handlePeriodChange = (periodId) => {
    dispatch(setTopProductsPeriod(periodId));
  };

  const handlePrint = () => {
    window.print();
  };

  // ── Computations ──
  const adminToday = adminSummary?.today || { revenue: 0, transactionCount: 0 };
  const adminAllTime = adminSummary?.allTime || { revenue: 0, transactionCount: 0 };
  const adminInventory = adminSummary?.inventory || {
    totalActiveProducts: 0,
    lowStockAlertCount: 0,
  };
  const adminStaff = adminSummary?.staff || { totalActiveStaff: 0 };
  const chartData = adminSummary?.revenueChart?.data || [];
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue || 0), 100);

  // Top products relative max for progress bar
  const topList = topProducts?.products || [];
  const maxUnitsSold = Math.max(...topList.map((p) => p.totalQuantitySold || 0), 1);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Business Intelligence &amp; Reports
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Live DB Synced
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Comprehensive audit reports, sales revenue analytics, multi-category inventory health,
            and bestseller performance.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => loadDataForTab(activeReportTab, topProductsPeriod)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium shadow-sm transition-colors"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <HiOutlinePrinter className="w-4 h-4" />
            <span>Export / Print</span>
          </button>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm scrollbar-none">
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.01]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: DASHBOARD ANALYTICS & 7-DAY TREND
          ══════════════════════════════════════════════════════════════════════ */}
      {activeReportTab === 'dashboard_analytics' && (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Today's Sales Revenue"
              value={`$${adminToday.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={`${adminToday.transactionCount} transactions processed today`}
              icon={HiOutlineCurrencyDollar}
              iconBg="from-emerald-500 to-teal-600"
              badgeText="Today's Sales"
              badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
            />

            <StatCard
              title="All-Time Total Revenue"
              value={`$${adminAllTime.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={`${adminAllTime.transactionCount} total lifetime transactions`}
              icon={HiOutlineShoppingCart}
              iconBg="from-blue-600 to-indigo-600"
              badgeText="Lifetime Sales"
              badgeColor="bg-blue-50 text-blue-700 border-blue-200"
            />

            <StatCard
              title="Active Inventory SKUs"
              value={adminInventory.totalActiveProducts}
              subtitle="Active products for sale"
              icon={HiOutlineCube}
              iconBg="from-purple-500 to-indigo-600"
              badgeText="Catalog Size"
              badgeColor="bg-purple-50 text-purple-700 border-purple-200"
            />

            <StatCard
              title="Low Stock Alerts"
              value={adminInventory.lowStockAlertCount}
              subtitle={
                adminInventory.lowStockAlertCount > 0
                  ? 'Products at or below threshold'
                  : 'All inventory levels safe'
              }
              icon={HiOutlineExclamationCircle}
              iconBg="from-rose-500 to-amber-600"
              badgeText={adminInventory.lowStockAlertCount > 0 ? 'Deficit Action' : 'Optimal'}
              badgeColor={
                adminInventory.lowStockAlertCount > 0
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }
            />
          </div>

          {/* Interactive 7-Day Revenue Trend Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  7-Day Sales &amp; Revenue Analytics
                </h3>
                <p className="text-xs text-slate-500">
                  Daily POS checkout revenue aggregates over the trailing 7-day period
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                Interactive Chart
              </span>
            </div>

            {/* Custom Bar Visualization */}
            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                No recent transaction history recorded
              </div>
            ) : (
              <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 pt-8 px-4">
                {chartData.map((day, idx) => {
                  const heightPercent = Math.max(14, Math.round((day.revenue / maxRevenue) * 100));
                  const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={day.date || idx}
                      className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end"
                    >
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-xl pointer-events-none shadow-xl z-20 whitespace-nowrap">
                        ${day.revenue.toFixed(2)} • {day.transaction_count} transaction
                        {day.transaction_count !== 1 ? 's' : ''}
                      </div>

                      {/* Bar */}
                      <div className="w-full max-w-[56px] bg-slate-100 rounded-2xl overflow-hidden flex flex-col justify-end h-48">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-blue-600 via-indigo-500 to-blue-400 rounded-2xl group-hover:from-blue-500 group-hover:to-indigo-300 transition-all duration-300 shadow-sm"
                        />
                      </div>

                      {/* Label */}
                      <span className="text-xs font-bold text-slate-600 text-center truncate max-w-full">
                        {formattedDate}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Automatic time-zone normalization via PostgreSQL engine</span>
              <span>Updated in real-time on every POS checkout</span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: TODAY'S SALES BREAKDOWN
          ══════════════════════════════════════════════════════════════════════ */}
      {activeReportTab === 'sales_report' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Gross Revenue</span>
              <p className="text-2xl font-black text-slate-900">
                ${todaysSales?.summary?.totalRevenue?.toFixed(2) || '0.00'}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold">
                Today's total takings
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Subtotal</span>
              <p className="text-2xl font-black text-slate-900">
                ${todaysSales?.summary?.totalSubtotal?.toFixed(2) || '0.00'}
              </p>
              <span className="text-[11px] text-slate-400">Pre-tax merchandise</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Tax Collected</span>
              <p className="text-2xl font-black text-blue-600">
                ${todaysSales?.summary?.totalTax?.toFixed(2) || '0.00'}
              </p>
              <span className="text-[11px] text-slate-400">Store sales tax share</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Transactions</span>
              <p className="text-2xl font-black text-slate-900">
                {todaysSales?.summary?.transactionCount || 0}
              </p>
              <span className="text-[11px] text-slate-400">Total customer receipts</span>
            </div>
          </div>

          {/* Payment Method Distribution & Cashier Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Method Share */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <HiOutlineCreditCard className="w-5 h-5 text-blue-600" />
                <span>Payment Method Breakdown</span>
              </h3>

              <div className="space-y-4 pt-2">
                {Object.entries(todaysSales?.paymentMethodBreakdown || {}).map(
                  ([method, amount]) => {
                    const total = todaysSales?.summary?.totalRevenue || 1;
                    const pct = Math.round((amount / total) * 100);

                    const getMethodBadge = (m) => {
                      switch (m) {
                        case 'card':
                          return {
                            label: 'Credit / Debit Card',
                            icon: HiOutlineCreditCard,
                            color: 'from-blue-600 to-indigo-600',
                            text: 'text-blue-700',
                          };
                        case 'mobile_payment':
                        case 'upi_digital':
                          return {
                            label: 'Digital / UPI',
                            icon: HiOutlineDeviceMobile,
                            color: 'from-purple-600 to-violet-600',
                            text: 'text-purple-700',
                          };
                        default:
                          return {
                            label: 'Cash Tender',
                            icon: HiOutlineCash,
                            color: 'from-emerald-600 to-teal-600',
                            text: 'text-emerald-700',
                          };
                      }
                    };

                    const config = getMethodBadge(method);
                    const Icon = config.icon;

                    return (
                      <div key={method} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${config.text}`} />
                            <span className="font-bold text-slate-800">{config.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">
                              ${amount.toFixed(2)}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">({pct}%)</span>
                          </div>
                        </div>

                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className={`h-full bg-gradient-to-r ${config.color} rounded-full transition-all duration-500`}
                          />
                        </div>
                      </div>
                    );
                  }
                )}

                {Object.keys(todaysSales?.paymentMethodBreakdown || {}).length === 0 && (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No payment records recorded for today yet.
                  </p>
                )}
              </div>
            </div>

            {/* Cashier Contribution Breakdown */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <HiOutlineUsers className="w-5 h-5 text-purple-600" />
                <span>Cashier Staff Sales Contribution</span>
              </h3>

              <div className="space-y-3 pt-2">
                {Object.entries(todaysSales?.cashierBreakdown || {}).map(([name, data]) => (
                  <div
                    key={name}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">{name}</p>
                        <p className="text-[11px] text-slate-400">
                          {data.transactionCount} transactions processed
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-extrabold text-sm text-slate-900">
                        ${data.revenue.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Avg: ${(data.revenue / (data.transactionCount || 1)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                {Object.keys(todaysSales?.cashierBreakdown || {}).length === 0 && (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No cashier transactions recorded today.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Today's Transactions Log Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                Today's Detailed Invoices Ledger
              </h3>
              <span className="text-xs text-slate-500">
                {todaysSales?.transactions?.length || 0} invoices logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Invoice #</th>
                    <th className="px-5 py-3.5">Cashier</th>
                    <th className="px-5 py-3.5">Payment</th>
                    <th className="px-5 py-3.5">Subtotal</th>
                    <th className="px-5 py-3.5">Tax</th>
                    <th className="px-5 py-3.5 text-right">Grand Total</th>
                    <th className="px-5 py-3.5 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(todaysSales?.transactions || []).map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-blue-600">
                        {t.invoiceNumber}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {t.cashier?.name || 'Counter Cashier'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="capitalize px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {t.paymentMethod?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        ${parseFloat(t.subtotal).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        ${parseFloat(t.taxAmount).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-slate-900">
                        ${parseFloat(t.grandTotal).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs text-slate-400">
                        {new Date(t.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                  {(!todaysSales?.transactions || todaysSales.transactions.length === 0) && (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400">
                        No transactions completed yet today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: INVENTORY & MULTI-CATEGORY HEALTH
          ══════════════════════════════════════════════════════════════════════ */}
      {activeReportTab === 'inventory_report' && (
        <div className="space-y-6">
          {/* Inventory Overview KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Catalog SKUs</span>
              <p className="text-2xl font-black text-slate-900">
                {inventoryStats?.products?.total || 0}
              </p>
              <span className="text-[11px] text-slate-500">Registered products</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Active for Sale</span>
              <p className="text-2xl font-black text-emerald-600">
                {inventoryStats?.products?.active || 0}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold">Available on POS</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Low Stock Deficits</span>
              <p className="text-2xl font-black text-amber-600">
                {inventoryStats?.lowStock?.count || 0}
              </p>
              <span className="text-[11px] text-amber-700 font-semibold">
                Items below threshold
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Expiring Cold Storage
              </span>
              <p className="text-2xl font-black text-rose-600">
                {inventoryStats?.expiryAlerts?.count || 0}
              </p>
              <span className="text-[11px] text-rose-600 font-semibold">≤ 72 hours remaining</span>
            </div>
          </div>

          {/* Multi-Category Distribution Bars */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  Multi-Category SKU Share &amp; Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Catalog product count and percentage segmented across retail categories
                </p>
              </div>
              <Link
                to="/categories"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                View Category Specs <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4 pt-2">
              {(inventoryStats?.categoryBreakdown || []).map((cat) => {
                const total = inventoryStats?.products?.total || 1;
                const count = parseInt(cat.count, 10);
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <CategoryBadge category={cat.category} />
                        <span className="font-bold text-slate-800">{count} SKUs</span>
                      </div>
                      <span className="font-bold text-slate-500">{pct}% Share</span>
                    </div>

                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cold Chain Perishables Expiry Alert Cards */}
          {(inventoryStats?.expiryAlerts?.count || 0) > 0 && (
            <div className="p-6 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiOutlineClock className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-rose-900 text-base">
                    Cold Chain Expiration Alerts ({inventoryStats.expiryAlerts.count} Items within
                    72h)
                  </h3>
                </div>
                <span className="text-xs font-bold text-rose-700 uppercase">
                  Immediate Rotation Required
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {inventoryStats.expiryAlerts.products.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-white border border-rose-200 shadow-sm space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-bold text-slate-900 text-sm line-clamp-1">{p.name}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                        {p.daysUntilExpiry <= 0 ? 'Expired' : `${p.daysUntilExpiry}d left`}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-slate-400">
                      SKU: {p.sku} • Temp: {p.storageTemp}
                    </p>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <span className="text-slate-500">Stock: {p.quantityInStock}</span>
                      <Link
                        to={`/inventory/${p.id}`}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Inspect Product &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4: LOW STOCK & DEFICIT AUDIT
          ══════════════════════════════════════════════════════════════════════ */}
      {activeReportTab === 'low_stock' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Low-Stock SKUs"
              value={lowStockReport?.summary?.totalLowStockItems || 0}
              subtitle="Items below safety reorder threshold"
              icon={HiOutlineExclamationCircle}
              iconBg="from-amber-500 to-orange-600"
              badgeText="Replenish Needed"
              badgeColor="bg-amber-100 text-amber-800 border-amber-200"
            />

            <StatCard
              title="Critical Out of Stock"
              value={lowStockReport?.summary?.outOfStockItems || 0}
              subtitle="0 inventory remaining (POS unbillable)"
              icon={HiOutlineExclamationCircle}
              iconBg="from-rose-600 to-red-700"
              badgeText="Critical Alert"
              badgeColor="bg-rose-100 text-rose-700 border-rose-200"
            />

            <StatCard
              title="Categories Impacted"
              value={lowStockReport?.summary?.categoriesAffected || 0}
              subtitle="Specialized departments with deficits"
              icon={HiOutlineCube}
              iconBg="from-blue-600 to-indigo-600"
              badgeText="Departments"
              badgeColor="bg-blue-50 text-blue-700 border-blue-200"
            />
          </div>

          {/* Grouped Category Deficit Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  Low-Stock Deficit Audit by Department
                </h3>
                <p className="text-xs text-slate-500">
                  Detailed replenishment deficits required to restore safety threshold floors
                </p>
              </div>
              <Link
                to="/inventory/low-stock"
                className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                Go to Replenishment Hub <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {Object.keys(lowStockReport?.groupedByCategory || {}).length === 0 ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center">
                <HiOutlineCheckCircle className="w-12 h-12 text-emerald-500 mb-2" />
                <p className="font-bold text-slate-700">All Inventory Levels Healthy</p>
                <p className="text-xs mt-1">
                  No products are currently at or below reorder thresholds.
                </p>
              </div>
            ) : (
              Object.entries(lowStockReport.groupedByCategory).map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={category} />
                      <span className="text-xs font-bold text-slate-500">
                        ({items.length} depleted items)
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm text-slate-600">
                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="px-4 py-2.5">Product &amp; SKU</th>
                          <th className="px-4 py-2.5">Current Stock</th>
                          <th className="px-4 py-2.5">Reorder Threshold</th>
                          <th className="px-4 py-2.5">Deficit Units</th>
                          <th className="px-4 py-2.5">Severity</th>
                          <th className="px-4 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/60">
                            <td className="px-4 py-2.5">
                              <p className="font-bold text-slate-900 text-xs sm:text-sm">
                                {item.name}
                              </p>
                              <p className="font-mono text-[10px] text-slate-400">{item.sku}</p>
                            </td>
                            <td className="px-4 py-2.5">
                              <StockBadge
                                quantity={item.quantityInStock}
                                threshold={item.reorderThreshold}
                              />
                            </td>
                            <td className="px-4 py-2.5 font-medium text-slate-600">
                              {item.reorderThreshold} units
                            </td>
                            <td className="px-4 py-2.5 font-mono font-bold text-rose-600">
                              +{item.stockDeficit} needed
                            </td>
                            <td className="px-4 py-2.5">
                              {item.severity === 'out_of_stock' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700">
                                  OUT OF STOCK
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                  LOW STOCK
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <Link
                                to={`/inventory/${item.id}`}
                                className="text-xs font-bold text-blue-600 hover:underline"
                              >
                                Restock &rarr;
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 5: TOP-SELLING BESTSELLERS LEADERBOARD
          ══════════════════════════════════════════════════════════════════════ */}
      {activeReportTab === 'top_products' && (
        <div className="space-y-6">
          {/* Filter Period Buttons */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <HiOutlineTrendingUp className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-slate-800 text-sm">
                Select Analytics Time Window:
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {PERIOD_CONFIG.map((p) => {
                const isSelected = topProductsPeriod === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePeriodChange(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Leaderboard Table / Cards */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  Ranked Top-Selling Products
                </h3>
                <p className="text-xs text-slate-500">
                  Products ranked by volume of units sold and gross revenue contribution
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {topList.length} ranked products
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5 text-center">Rank</th>
                    <th className="px-5 py-3.5">Product Name &amp; SKU</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Units Sold (Relative Share)</th>
                    <th className="px-5 py-3.5">Avg Price</th>
                    <th className="px-5 py-3.5 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topList.map((p, idx) => {
                    const rank = idx + 1;
                    const sharePct = Math.round((p.totalQuantitySold / maxUnitsSold) * 100);

                    const getRankBadge = (r) => {
                      if (r === 1) return 'bg-amber-100 text-amber-900 border-amber-300 font-black';
                      if (r === 2) return 'bg-slate-200 text-slate-800 border-slate-300 font-bold';
                      if (r === 3)
                        return 'bg-orange-100 text-orange-800 border-orange-200 font-bold';
                      return 'bg-slate-100 text-slate-600 font-medium';
                    };

                    return (
                      <tr
                        key={p.productId || idx}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        {/* Rank */}
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs border ${getRankBadge(
                              rank
                            )}`}
                          >
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                          </span>
                        </td>

                        {/* Product Info */}
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-900 text-sm">{p.productName}</p>
                          <p className="font-mono text-xs text-slate-400">{p.sku}</p>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-3.5">
                          <CategoryBadge category={p.category} />
                        </td>

                        {/* Units Sold with Relative Share Bar */}
                        <td className="px-5 py-3.5">
                          <div className="space-y-1 max-w-[200px]">
                            <div className="flex justify-between text-xs font-bold text-slate-800">
                              <span>{p.totalQuantitySold} units</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {p.transactionCount} orders
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${sharePct}%` }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                              />
                            </div>
                          </div>
                        </td>

                        {/* Avg Price */}
                        <td className="px-5 py-3.5 font-medium text-slate-700">
                          ${parseFloat(p.avgUnitPrice || 0).toFixed(2)}
                        </td>

                        {/* Gross Revenue */}
                        <td className="px-5 py-3.5 text-right font-black text-slate-900 text-base">
                          ${parseFloat(p.totalRevenue || 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}

                  {topList.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-slate-400">
                        No sales transactions recorded for the selected time period (
                        {topProductsPeriod}).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
