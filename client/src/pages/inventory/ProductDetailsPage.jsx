/**
 * @file src/pages/inventory/ProductDetailsPage.jsx
 * @description In-depth product profile displaying extended category specifications, barcode, inventory valuation, and stock control.
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import {
  fetchProductDetailsThunk,
  adjustStockThunk,
  selectInventoryState,
} from '@/features/inventory/inventorySlice';
import { CATEGORIES } from '@/constants/categories';
import { CategoryBadge, StockBadge } from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';

import {
  HiOutlineArrowLeft,
  HiOutlinePencilAlt,
  HiOutlineAdjustments,
  HiOutlinePhotograph,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineChip,
  HiOutlineExclamation,
  HiOutlineSparkles,
  HiOutlineCurrencyDollar,
  HiOutlineCube,
} from 'react-icons/hi';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProduct, isLoading } = useSelector(selectInventoryState);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockMode, setStockMode] = useState('add');
  const [stockQty, setStockQty] = useState(15);
  const [stockReason, setStockReason] = useState('Restock via Product Profile');

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetailsThunk(id));
    }
  }, [dispatch, id]);

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      adjustStockThunk({
        id: currentProduct.id,
        stockData: {
          quantity: parseInt(stockQty, 10),
          action: stockMode,
          reason: stockReason,
        },
      })
    );

    if (adjustStockThunk.fulfilled.match(result)) {
      toast.success(`Inventory stock updated successfully!`);
      setIsStockModalOpen(false);
    } else {
      toast.error(result.payload || 'Failed to adjust stock');
    }
  };

  if (isLoading || !currentProduct) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <span>Loading product specifications...</span>
      </div>
    );
  }

  const unitPrice = parseFloat(currentProduct.price) || 0;
  const stock = currentProduct.quantityInStock || 0;
  const inventoryValue = (unitPrice * stock).toFixed(2);
  const threshold = currentProduct.reorderThreshold || 5;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/inventory"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-blue-600 mb-2 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span>Back to Inventory</span>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {currentProduct.name}
            </h1>
            <CategoryBadge category={currentProduct.category} />
            <StockBadge quantity={stock} threshold={threshold} />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
            SKU: <span className="font-bold text-slate-700">{currentProduct.sku}</span> &bull;
            Product ID: {currentProduct.id}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStockModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold shadow-sm transition-colors"
          >
            <HiOutlineAdjustments className="w-4 h-4 text-emerald-600" />
            <span>Adjust Stock</span>
          </button>

          <Link
            to={`/inventory/edit/${currentProduct.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            <HiOutlinePencilAlt className="w-4 h-4" />
            <span>Edit Details</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Overview & Media */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Image & Barcode Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col items-center justify-between text-center space-y-4">
          <div className="w-full aspect-square max-w-[240px] rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
            {currentProduct.imageUrl ? (
              <img
                src={currentProduct.imageUrl}
                alt={currentProduct.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <HiOutlinePhotograph className="w-16 h-16 text-slate-400" />
            )}
          </div>

          <div className="w-full pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Barcode / SKU Identifier
            </span>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center">
              <div className="font-mono text-base font-bold text-slate-900 tracking-widest">
                {currentProduct.sku}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">Code-128 Scannable</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Retail Financials & Inventory KPIs */}
        <div className="md:col-span-2 space-y-6">
          {/* Financial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                <HiOutlineCurrencyDollar className="w-4 h-4 text-emerald-600" />
                <span>Unit Retail Price</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">${unitPrice.toFixed(2)}</p>
              <span className="text-[11px] text-slate-400">Pre-tax customer price</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                <HiOutlineCube className="w-4 h-4 text-blue-600" />
                <span>On-Hand Quantity</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{stock} units</p>
              <span className="text-[11px] text-slate-400">Safety floor: {threshold} units</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                <HiOutlineSparkles className="w-4 h-4 text-purple-600" />
                <span>Inventory Valuation</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">${inventoryValue}</p>
              <span className="text-[11px] text-slate-400">Gross retail asset value</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-800 text-sm">Product Description</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {currentProduct.description || 'No detailed product description provided.'}
            </p>
          </div>

          {/* Category-Specific Compliance Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <HiOutlineShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Category Compliance: {currentProduct.category}</span>
              </h3>
              <CategoryBadge category={currentProduct.category} />
            </div>

            {/* FRAGILE */}
            {currentProduct.category === CATEGORIES.FRAGILE && currentProduct.fragileDetail && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-100">
                  <span className="text-[11px] font-bold text-purple-700 uppercase">
                    Packaging Material
                  </span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {currentProduct.fragileDetail.packagingMaterial}
                  </p>
                </div>
                <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-100">
                  <span className="text-[11px] font-bold text-purple-700 uppercase">
                    Handling Instructions
                  </span>
                  <p className="text-sm text-slate-700 mt-0.5">
                    {currentProduct.fragileDetail.handlingInstructions ||
                      'Standard fragile handling.'}
                  </p>
                </div>
              </div>
            )}

            {/* COLD */}
            {currentProduct.category === CATEGORIES.COLD && currentProduct.coldDetail && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-cyan-50/60 rounded-xl border border-cyan-100">
                    <span className="text-[11px] font-bold text-cyan-700 uppercase">
                      Storage Temperature Bounds
                    </span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {currentProduct.coldDetail.storageTemp}
                    </p>
                  </div>
                  <div className="p-3.5 bg-cyan-50/60 rounded-xl border border-cyan-100">
                    <span className="text-[11px] font-bold text-cyan-700 uppercase">
                      Expiration Date
                    </span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {new Date(currentProduct.coldDetail.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {currentProduct.coldDetail.isExpiringSoon && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <HiOutlineClock className="w-4 h-4" />
                    <span>
                      URGENT: This item expires in {currentProduct.coldDetail.daysUntilExpiry} days.
                      Prioritize stock rotation.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* TECH */}
            {currentProduct.category === CATEGORIES.TECH && currentProduct.techDetail && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
                  <span className="text-[11px] font-bold text-blue-700 uppercase">
                    Warranty Duration
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {currentProduct.techDetail.warrantyPeriodMonths} Months Manufacturer Coverage
                  </p>
                </div>
                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
                  <span className="text-[11px] font-bold text-blue-700 uppercase">
                    Serial Number / Batch
                  </span>
                  <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                    {currentProduct.techDetail.serialNumber || 'N/A'}
                  </p>
                </div>
              </div>
            )}

            {/* CLEANING */}
            {currentProduct.category === CATEGORIES.CLEANING && currentProduct.cleaningDetail && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase">
                      Hazard Classification
                    </span>
                    <p className="text-sm font-bold text-amber-700 mt-0.5">
                      {currentProduct.cleaningDetail.hazardLevel} Hazard
                    </p>
                  </div>
                  <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase">
                      Safety Protocol
                    </span>
                    <p className="text-xs text-slate-700 mt-0.5">
                      {currentProduct.cleaningDetail.safetyInstructions ||
                        'Wear gloves; avoid eye contact.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* GENERAL */}
            {currentProduct.category === CATEGORIES.GENERAL && (
              <p className="text-xs text-slate-500">
                General merchandise adhering to standard dry goods retail specifications.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* STOCK ADJUSTMENT MODAL */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={`Adjust Stock for '${currentProduct.name}'`}
        subtitle={`Current Inventory: ${stock} units`}
      >
        <form onSubmit={handleStockSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adjustment Action
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStockMode('add')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  stockMode === 'add'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                + Add Stock
              </button>
              <button
                type="button"
                onClick={() => setStockMode('deduct')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  stockMode === 'deduct'
                    ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                - Deduct Stock
              </button>
              <button
                type="button"
                onClick={() => setStockMode('set')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  stockMode === 'set'
                    ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                = Set Exact
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity ({stockMode === 'set' ? 'New Total' : 'Adjustment Amount'})
            </label>
            <input
              type="number"
              min="0"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Reference
            </label>
            <input
              type="text"
              value={stockReason}
              onChange={(e) => setStockReason(e.target.value)}
              placeholder="e.g. Warehouse Batch Arrival"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none"
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsStockModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/20"
            >
              Confirm Stock Update
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductDetailsPage;
