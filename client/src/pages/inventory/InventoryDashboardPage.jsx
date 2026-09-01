/**
 * @file src/pages/inventory/InventoryDashboardPage.jsx
 * @description Specialized Dashboard for Inventory Managers: Stock Health KPIs, Category Distribution, Expiry Alerts, and Fast Replenishment Actions.
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchInventoryDashboardStatsThunk,
  adjustStockThunk,
  selectInventoryState,
} from '@/features/inventory/inventorySlice';
import StatCard from '@/components/common/StatCard';
import { CategoryBadge, StockBadge } from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';

import {
  HiOutlineCube,
  HiOutlineExclamationCircle,
  HiOutlineClock,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineAdjustments,
  HiOutlineArrowRight,
  HiOutlineSparkles,
} from 'react-icons/hi';

const InventoryDashboardPage = () => {
  const dispatch = useDispatch();
  const { dashboardStats, isLoading } = useSelector(selectInventoryState);

  // Quick Restock Dialog
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockAmount, setRestockAmount] = useState(20);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

  const loadData = () => {
    dispatch(fetchInventoryDashboardStatsThunk());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const products = dashboardStats?.products || { total: 0, active: 0, inactive: 0 };
  const lowStock = dashboardStats?.lowStock || { count: 0, products: [] };
  const categoryBreakdown = dashboardStats?.categoryBreakdown || [];
  const expiryAlerts = dashboardStats?.expiryAlerts || { count: 0, products: [] };

  const handleOpenRestock = (product) => {
    setRestockProduct(product);
    setRestockAmount(Math.max(10, (product.reorderThreshold || 5) * 2));
    setIsRestockModalOpen(true);
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      adjustStockThunk({
        id: restockProduct.id,
        stockData: {
          quantity: parseInt(restockAmount, 10),
          action: 'add',
          reason: 'Quick Replenishment via Inventory Dashboard',
        },
      })
    );

    if (adjustStockThunk.fulfilled.match(result)) {
      toast.success(`Added +${restockAmount} units to '${restockProduct.name}'`);
      setIsRestockModalOpen(false);
      setRestockProduct(null);
      loadData();
    } else {
      toast.error(result.payload || 'Failed to adjust stock');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventory &amp; Stock Operations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Warehouse console: Track multi-category stock levels, cold chain expiry dates, and
            replenishment deficits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium shadow-sm"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Stock Data</span>
          </button>

          <Link
            to="/inventory/add"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Catalog Items"
          value={products.total}
          subtitle={`${products.active} active for sale (${products.inactive} inactive)`}
          icon={HiOutlineCube}
          iconBg="from-blue-600 to-indigo-600"
          badgeText="Active SKUs"
          badgeColor="bg-blue-50 text-blue-700 border-blue-200"
        />

        <StatCard
          title="Low-Stock Alerts"
          value={lowStock.count}
          subtitle={
            lowStock.count > 0
              ? 'Items at or below safety threshold'
              : 'All products currently in stock'
          }
          icon={HiOutlineExclamationCircle}
          iconBg="from-amber-500 to-orange-600"
          badgeText={lowStock.count > 0 ? 'Replenish' : 'Safe'}
          badgeColor={
            lowStock.count > 0
              ? 'bg-amber-100 text-amber-800 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }
        />

        <StatCard
          title="Expiring Cold Storage"
          value={expiryAlerts.count}
          subtitle="Items with ≤ 72 hours remaining"
          icon={HiOutlineClock}
          iconBg="from-rose-500 to-pink-600"
          badgeText={expiryAlerts.count > 0 ? 'Urgent Review' : 'Optimal'}
          badgeColor={
            expiryAlerts.count > 0
              ? 'bg-rose-100 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }
        />

        <StatCard
          title="Specialized Categories"
          value={categoryBreakdown.length}
          subtitle="Fragile, Cold, Tech, Cleaning, General"
          icon={HiOutlineSparkles}
          iconBg="from-purple-500 to-indigo-600"
          badgeText="Compliance Specs"
          badgeColor="bg-purple-50 text-purple-700 border-purple-200"
        />
      </div>

      {/* Quick Launch & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Progress */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                Multi-Category Inventory Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Active catalog SKUs segmented by specialized retail category
              </p>
            </div>
            <Link
              to="/categories"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              Specifications <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 pt-2">
            {categoryBreakdown.map((cat) => {
              const count = parseInt(cat.count, 10);
              const percentage =
                products.total > 0 ? Math.round((count / products.total) * 100) : 0;

              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={cat.category} />
                      <span className="font-semibold text-slate-800">{count} SKUs</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{percentage}%</span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percentage}%` }}
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Navigation Quick Links */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-white">Warehouse Tools</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Quick Hub
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Fast access to SKU barcode lookup, low-stock deficit audits, and product creation.
            </p>

            <div className="space-y-2.5">
              <Link
                to="/inventory/add"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <HiOutlinePlus className="w-4 h-4" />
                  </div>
                  <span>Add New Product (with Specs)</span>
                </div>
                <HiOutlineArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </Link>

              <Link
                to="/inventory/search"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <HiOutlineSearch className="w-4 h-4" />
                  </div>
                  <span>Barcode &amp; SKU Scanner Search</span>
                </div>
                <HiOutlineArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </Link>

              <Link
                to="/inventory/low-stock"
                className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-300 transition-all group text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <HiOutlineExclamationCircle className="w-4 h-4" />
                  </div>
                  <span>Low Stock Replenishment Hub</span>
                </div>
                <HiOutlineArrowRight className="w-4 h-4 text-amber-400 group-hover:text-amber-200" />
              </Link>

              <Link
                to="/categories"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <HiOutlineSparkles className="w-4 h-4" />
                  </div>
                  <span>Category Compliance Specs</span>
                </div>
                <HiOutlineArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <span className="text-[11px] text-slate-400">
              Warehouse Inventory Console &bull; Live DB Sync
            </span>
          </div>
        </div>
      </div>

      {/* Expiring Soon Perishables Alert (Cold Category) */}
      {expiryAlerts.count > 0 && (
        <div className="bg-rose-50/70 rounded-2xl border border-rose-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HiOutlineClock className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-rose-900 text-sm sm:text-base">
                Perishable Cold Chain Alert: {expiryAlerts.count} items expiring within 72 hours
              </h3>
            </div>
            <Link
              to="/inventory?category=Cold"
              className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline"
            >
              Filter Cold Items
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {expiryAlerts.products.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-white rounded-xl border border-rose-200/80 shadow-sm flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 whitespace-nowrap">
                      {item.daysUntilExpiry <= 0 ? 'Expired!' : `${item.daysUntilExpiry}d left`}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {item.sku} &bull; Temp: {item.storageTemp}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500">In Stock: {item.quantityInStock}</span>
                  <Link
                    to={`/inventory/${item.id}`}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    View &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Urgent Low-Stock Replenishment Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Low-Stock Items Needing Replenishment
            </h3>
            <p className="text-xs text-slate-500">
              Instant action table for items at or below minimum threshold
            </p>
          </div>
          <Link
            to="/inventory/low-stock"
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            View Full Deficit Audit <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Product &amp; SKU</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Current Stock</th>
                <th className="px-5 py-3.5">Reorder Threshold</th>
                <th className="px-5 py-3.5 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowStock.products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    All inventory items are currently above safe threshold levels.
                  </td>
                </tr>
              ) : (
                lowStock.products.slice(0, 8).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                      <p className="font-mono text-xs text-slate-400">{p.sku}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <CategoryBadge category={p.category} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StockBadge quantity={p.quantityInStock} threshold={p.reorderThreshold} />
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-500">
                      {p.reorderThreshold} units
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenRestock(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                      >
                        <HiOutlineAdjustments className="w-4 h-4" />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK RESTOCK MODAL */}
      <Modal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        title={`Restock Product: ${restockProduct?.name}`}
        subtitle={`Current stock: ${restockProduct?.quantityInStock} units (Threshold: ${restockProduct?.reorderThreshold})`}
      >
        <form onSubmit={handleRestockSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity to Add *
            </label>
            <input
              type="number"
              min="1"
              value={restockAmount}
              onChange={(e) => setRestockAmount(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold"
              required
            />
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Quick presets:</span>
            {[10, 25, 50, 100].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRestockAmount(num)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
              >
                +{num}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRestockModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/20"
            >
              Confirm +{restockAmount} Stock
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryDashboardPage;
