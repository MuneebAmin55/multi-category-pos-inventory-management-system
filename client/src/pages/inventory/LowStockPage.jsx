/**
 * @file src/pages/inventory/LowStockPage.jsx
 * @description Dedicated Low-Stock & Deficit Audit center with reorder calculations and fast replenishment workflows.
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchLowStockReportThunk,
  adjustStockThunk,
  selectInventoryState,
} from '@/features/inventory/inventorySlice';
import StatCard from '@/components/common/StatCard';
import { CategoryBadge, StockBadge } from '@/components/common/Badge';
import SearchInput from '@/components/common/SearchInput';
import Modal from '@/components/common/Modal';
import { StatCardSkeleton, TableSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import toast from 'react-hot-toast';

import {
  HiOutlineExclamationCircle,
  HiOutlineCube,
  HiOutlineRefresh,
  HiOutlineAdjustments,
  HiOutlineArrowLeft,
  HiOutlineShoppingCart,
} from 'react-icons/hi';

const LowStockPage = () => {
  const dispatch = useDispatch();
  const { lowStockReport, isLoading } = useSelector(selectInventoryState);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [restockProduct, setRestockProduct] = useState(null);
  const [restockAmount, setRestockAmount] = useState(25);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

  const loadData = () => {
    dispatch(fetchLowStockReportThunk());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const summary = lowStockReport?.summary || {
    totalLowStockItems: 0,
    outOfStockItems: 0,
    categoriesAffected: 0,
  };

  const grouped = lowStockReport?.groupedByCategory || {};

  // Flatten all items for filter & search
  const allItems = Object.entries(grouped).flatMap(([category, items]) =>
    items.map((item) => ({ ...item, category }))
  );

  const filteredItems = allItems.filter((item) => {
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    const matchesSearch = searchTerm
      ? item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const totalDeficitUnits = allItems.reduce(
    (acc, curr) => acc + Math.max(0, curr.stockDeficit || 0),
    0
  );

  const handleOpenRestock = (item) => {
    setRestockProduct(item);
    setRestockAmount(Math.max(10, (item.stockDeficit || 5) * 2));
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
          reason: 'Emergency Replenishment via Low-Stock Hub',
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
      {/* Header with Back link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/inventory"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-blue-600 mb-2 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Low-Stock &amp; Out-of-Stock Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time replenishment deficit audit: Identify depleted SKUs and replenish safety
            inventory floors.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium shadow-sm"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Stock Audit</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      {isLoading && !lowStockReport ? (
        <StatCardSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Depleted SKUs"
            value={summary.totalLowStockItems}
            subtitle="Products requiring inventory restock"
            icon={HiOutlineExclamationCircle}
            iconBg="from-amber-500 to-orange-600"
            badgeText="Stock Deficit"
            badgeColor="bg-amber-100 text-amber-800 border-amber-200"
          />

          <StatCard
            title="Critical Out of Stock (0 Units)"
            value={summary.outOfStockItems}
            subtitle="Zero inventory remaining (POS disabled)"
            icon={HiOutlineExclamationCircle}
            iconBg="from-rose-600 to-red-700"
            badgeText={summary.outOfStockItems > 0 ? 'CRITICAL' : 'Optimal'}
            badgeColor={
              summary.outOfStockItems > 0
                ? 'bg-rose-100 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }
          />

          <StatCard
            title="Total Stock Deficit Units"
            value={`+${totalDeficitUnits}`}
            subtitle="Units required to meet minimum safety thresholds"
            icon={HiOutlineCube}
            iconBg="from-blue-600 to-indigo-600"
            badgeText="Inventory Deficit"
            badgeColor="bg-blue-50 text-blue-700 border-blue-200"
          />
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={() => setSearchTerm('')}
          placeholder="Search depleted SKU or Product Name..."
        />

        <div className="w-full sm:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Depleted Categories</option>
            {Object.keys(grouped).map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({grouped[cat].length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Low-Stock Deficit Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">Product &amp; SKU</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Current Stock</th>
                <th className="px-5 py-4">Threshold</th>
                <th className="px-5 py-4">Min Deficit</th>
                <th className="px-5 py-4">Severity</th>
                <th className="px-5 py-4 text-right">Quick Replenish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-0">
                    <TableSkeleton rows={5} cols={7} />
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-0">
                    <EmptyState
                      icon={HiOutlineExclamationCircle}
                      title="All Stock Levels Optimal"
                      description="No products are currently depleted or below reorder threshold."
                      actionLabel={searchTerm || selectedCategory ? 'Clear Filters' : undefined}
                      onAction={() => {
                        setSearchTerm('');
                        setSelectedCategory('');
                      }}
                    />
                  </td>
                </tr>
              ) : (
                filteredItems.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <Link
                        to={`/inventory/${p.id}`}
                        className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors"
                      >
                        {p.name}
                      </Link>
                      <p className="font-mono text-xs text-slate-400">{p.sku}</p>
                    </td>

                    <td className="px-5 py-4">
                      <CategoryBadge category={p.category} />
                    </td>

                    <td className="px-5 py-4">
                      <StockBadge quantity={p.quantityInStock} threshold={p.reorderThreshold} />
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-500">
                      {p.reorderThreshold} units
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-blue-600">
                      +{p.stockDeficit} units
                    </td>

                    <td className="px-5 py-4">
                      {p.severity === 'out_of_stock' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                          OUT OF STOCK
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          LOW STOCK
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleOpenRestock(p)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold shadow-sm transition-colors"
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

      {/* RESTOCK MODAL */}
      <Modal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        title={`Restock '${restockProduct?.name}'`}
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

export default LowStockPage;
