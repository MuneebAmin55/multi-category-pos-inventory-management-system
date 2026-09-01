/**
 * @file src/pages/DashboardPage.jsx
 * @description Executive Dashboard with Role-Tailored views, animated skeleton loaders, and zero-shift layout.
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchAdminDashboardThunk,
  fetchRecentTransactionsThunk,
  selectDashboard,
} from '@/features/dashboard/dashboardSlice';
import {
  fetchTransactionsThunk,
  selectTransactionsState,
} from '@/features/transactions/transactionsSlice';
import { selectUser } from '@/features/auth/authSlice';
import { ROLES } from '@/constants/roles';
import StatCard from '@/components/common/StatCard';
import { CategoryBadge } from '@/components/common/Badge';
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import {
  HiOutlineCurrencyDollar,
  HiOutlineShoppingCart,
  HiOutlineCube,
  HiOutlineExclamationCircle,
  HiOutlineUsers,
  HiOutlinePlus,
  HiOutlineArrowRight,
  HiOutlineRefresh,
  HiOutlineClock,
  HiOutlineDocumentText,
} from 'react-icons/hi';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isCashier = user?.role === ROLES.CASHIER;

  const { summary, recentTransactions, isLoading: isAdminLoading } = useSelector(selectDashboard);
  const { transactions: cashierSales, isLoading: isCashierLoading } =
    useSelector(selectTransactionsState);

  const loadData = () => {
    if (isCashier) {
      dispatch(fetchTransactionsThunk({ limit: 10, page: 1, isCashierOnly: true }));
    } else {
      dispatch(fetchAdminDashboardThunk());
      dispatch(fetchRecentTransactionsThunk());
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch, isCashier]);

  const isLoading = isCashier ? isCashierLoading : isAdminLoading;

  // ── Cashier Metrics ──
  const cashierTotalSales = cashierSales.reduce(
    (sum, t) => sum + (parseFloat(t.grandTotal) || 0),
    0
  );
  const cashierAvgTicket = cashierSales.length > 0 ? cashierTotalSales / cashierSales.length : 0;

  // ── Admin Metrics ──
  const today = summary?.today || { revenue: 0, transactionCount: 0 };
  const allTime = summary?.allTime || { revenue: 0, transactionCount: 0 };
  const inventory = summary?.inventory || { totalActiveProducts: 0, lowStockAlertCount: 0 };
  const staff = summary?.staff || { totalActiveStaff: 0 };
  const chartData = summary?.revenueChart?.data || [];
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue || 0), 100);

  // ══════════════════════════════════════════════════════════════════════════
  // CASHIER DASHBOARD VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (isCashier) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Cashier Shift Command
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Active Session
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, <strong className="text-slate-800">{user?.name}</strong>. Monitor your
              counter metrics and launch fast billing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium shadow-sm transition-colors"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Shift</span>
            </button>

            <Link
              to="/pos"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition-all"
            >
              <HiOutlineShoppingCart className="w-4 h-4" />
              <span>Open POS Terminal</span>
            </Link>
          </div>
        </div>

        {/* Cashier KPI Cards */}
        {isLoading && cashierSales.length === 0 ? (
          <StatCardSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="My Shift Gross Sales"
              value={`$${cashierTotalSales.toFixed(2)}`}
              subtitle={`${cashierSales.length} invoices generated in this session`}
              icon={HiOutlineCurrencyDollar}
              iconBg="from-emerald-500 to-teal-600"
              badgeText="Counter Revenue"
              badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
            />

            <StatCard
              title="Transactions Processed"
              value={cashierSales.length}
              subtitle="Completed sales orders"
              icon={HiOutlineShoppingCart}
              iconBg="from-blue-600 to-indigo-600"
              badgeText="Sales Volume"
              badgeColor="bg-blue-50 text-blue-700 border-blue-200"
            />

            <StatCard
              title="Average Ticket Size"
              value={`$${cashierAvgTicket.toFixed(2)}`}
              subtitle="Average revenue per checkout"
              icon={HiOutlineDocumentText}
              iconBg="from-purple-500 to-indigo-600"
              badgeText="Avg / Customer"
              badgeColor="bg-purple-50 text-purple-700 border-purple-200"
            />
          </div>
        )}

        {/* Quick Launch Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg sm:text-xl text-white">
              Ready to process checkouts?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Scan barcode SKUs, adjust quantities with touch controls, and print 80mm receipts
              instantly.
            </p>
          </div>
          <Link
            to="/pos"
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-extrabold shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 flex-shrink-0"
          >
            <HiOutlineShoppingCart className="w-5 h-5" />
            <span>Launch POS Terminal</span>
          </Link>
        </div>

        {/* Cashier Recent Transactions Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                My Shift Transaction Records
              </h3>
              <p className="text-xs text-slate-500">Recent receipts generated from your counter</p>
            </div>
            <Link
              to="/transactions"
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              View Full History <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {isLoading && cashierSales.length === 0 ? (
              <TableSkeleton rows={4} />
            ) : cashierSales.length === 0 ? (
              <EmptyState
                icon={HiOutlineShoppingCart}
                title="No Sales Processed Yet"
                description="Your counter sales records for this shift will appear here once processed."
              />
            ) : (
              <table className="w-full text-left text-xs sm:text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Invoice #</th>
                    <th className="px-5 py-3.5">Payment Method</th>
                    <th className="px-5 py-3.5">Items</th>
                    <th className="px-5 py-3.5 text-right">Grand Total</th>
                    <th className="px-5 py-3.5 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cashierSales.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-blue-600">
                        {tx.invoiceNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="capitalize px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {tx.paymentMethod?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">{tx.items?.length || 0} line items</td>
                      <td className="px-5 py-3.5 text-right font-extrabold text-slate-900">
                        ${parseFloat(tx.grandTotal).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs text-slate-400 font-medium">
                        {new Date(tx.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ADMIN & INVENTORY MANAGER DASHBOARD VIEW
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Store Performance &amp; Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time analytics across inventory, POS transactions, and multi-category metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium shadow-sm transition-colors"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <Link
            to="/pos"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            <HiOutlineShoppingCart className="w-4 h-4" />
            <span>Open POS Terminal</span>
          </Link>
        </div>
      </div>

      {/* KPI Statistics Cards Grid */}
      {isLoading && !summary ? (
        <StatCardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <StatCard
            title="Today's Gross Sales"
            value={`$${today.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={`${today.transactionCount} transactions processed today`}
            icon={HiOutlineCurrencyDollar}
            iconBg="from-emerald-500 to-teal-600"
            badgeText="Today's Revenue"
            badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
          />

          <StatCard
            title="All-Time Revenue"
            value={`$${allTime.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={`${allTime.transactionCount} total lifetime invoices`}
            icon={HiOutlineShoppingCart}
            iconBg="from-blue-600 to-indigo-600"
            badgeText="Store Sales"
            badgeColor="bg-blue-50 text-blue-700 border-blue-200"
          />

          <StatCard
            title="Catalog &amp; Stock"
            value={inventory.totalActiveProducts}
            subtitle="Active SKUs in inventory"
            icon={HiOutlineCube}
            iconBg="from-purple-500 to-indigo-600"
            badgeText="Active Products"
            badgeColor="bg-purple-50 text-purple-700 border-purple-200"
          />

          <StatCard
            title="Low-Stock Alerts"
            value={inventory.lowStockAlertCount}
            subtitle={
              inventory.lowStockAlertCount > 0
                ? 'Items at or below reorder threshold'
                : 'All inventory stock healthy'
            }
            icon={HiOutlineExclamationCircle}
            iconBg="from-rose-500 to-amber-600"
            badgeText={inventory.lowStockAlertCount > 0 ? 'Urgent Action' : 'Optimal'}
            badgeColor={
              inventory.lowStockAlertCount > 0
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }
          />
        </div>
      )}

      {/* Charts & Quick Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Revenue Trend Chart */}
        <div className="lg:col-span-2">
          {isLoading && chartData.length === 0 ? (
            <ChartSkeleton />
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                      7-Day Revenue &amp; Sales Trend
                    </h3>
                    <p className="text-xs text-slate-500">
                      Daily total volume processed through POS checkout
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                    Last 7 Days
                  </span>
                </div>

                {/* Custom Bar Visualization */}
                {chartData.length === 0 ? (
                  <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
                    No recent transaction history recorded
                  </div>
                ) : (
                  <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
                    {chartData.map((day, idx) => {
                      const heightPercent = Math.max(
                        12,
                        Math.round((day.revenue / maxRevenue) * 100)
                      );
                      const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'numeric',
                        day: 'numeric',
                      });

                      return (
                        <div
                          key={day.date || idx}
                          className="flex-1 flex flex-col items-center gap-2 group relative"
                        >
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-[11px] font-semibold py-1 px-2 rounded-lg pointer-events-none shadow-lg z-10 whitespace-nowrap">
                            ${day.revenue.toFixed(2)} ({day.transaction_count} sales)
                          </div>

                          <div className="w-full max-w-[48px] bg-slate-100 rounded-xl overflow-hidden flex flex-col justify-end h-40">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-xl group-hover:from-blue-500 group-hover:to-indigo-400 transition-all duration-300 shadow-sm"
                            />
                          </div>

                          <span className="text-[11px] font-medium text-slate-500 text-center truncate max-w-full">
                            {formattedDate}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Aggregated automatically by transaction timestamps</span>
                <Link
                  to="/reports"
                  className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                >
                  View Full Analytics <HiOutlineArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Launch Panel */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-white">Management Console</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Admin Shortcuts
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Fast-track navigation to high-frequency operations, staff records, and stock
              inventory.
            </p>

            <div className="space-y-2.5">
              <Link
                to="/inventory"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <HiOutlineCube className="w-4 h-4" />
                  </div>
                  <span>Add / Manage Products</span>
                </div>
                <HiOutlinePlus className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </Link>

              <Link
                to="/users"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <HiOutlineUsers className="w-4 h-4" />
                  </div>
                  <span>Manage Staff Accounts ({staff.totalActiveStaff})</span>
                </div>
                <HiOutlineArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </Link>

              <Link
                to="/pos"
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 transition-all group text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <HiOutlineShoppingCart className="w-4 h-4" />
                  </div>
                  <span>Launch POS Scanner</span>
                </div>
                <HiOutlineArrowRight className="w-4 h-4 text-emerald-400 group-hover:text-emerald-200" />
              </Link>

              <Link
                to="/reports"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <HiOutlineCurrencyDollar className="w-4 h-4" />
                  </div>
                  <span>Sales &amp; Low-Stock Reports</span>
                </div>
                <HiOutlineArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <span className="text-[11px] text-slate-400">
              System running PostgreSQL Sequelize backend
            </span>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Recent Sales &amp; Checkout Transactions
            </h3>
            <p className="text-xs text-slate-500">
              Live snapshot of latest cashier checkout invoices
            </p>
          </div>
          <Link
            to="/transactions"
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            View All Invoices <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {isLoading && recentTransactions.length === 0 ? (
            <TableSkeleton rows={4} />
          ) : recentTransactions.length === 0 ? (
            <EmptyState
              icon={HiOutlineShoppingCart}
              title="No Recent Transactions"
              description="Completed checkout transactions will appear here."
            />
          ) : (
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Invoice #</th>
                  <th className="px-5 py-3.5">Cashier</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Items</th>
                  <th className="px-5 py-3.5 text-right">Grand Total</th>
                  <th className="px-5 py-3.5 text-right">Date &amp; Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-blue-600">
                      {tx.invoiceNumber}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {tx.cashier?.name || 'Cashier'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="capitalize px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {tx.paymentMethod?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">{tx.items?.length || 0} line items</td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                      ${parseFloat(tx.grandTotal).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-slate-400">
                      {new Date(tx.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
