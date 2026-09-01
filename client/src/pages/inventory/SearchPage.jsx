/**
 * @file src/pages/inventory/SearchPage.jsx
 * @description Dual-mode Inventory Search: Exact SKU / Barcode lookup (scanner mode)
 *   AND paginated general name + category search, both powered by existing Redux thunks.
 */

import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import {
  lookupProductBySkuThunk,
  clearSearchedProduct,
  selectInventoryState,
} from '@/features/inventory/inventorySlice';
import {
  fetchProductsThunk,
  setProductFilters,
  setProductPage,
  selectProductsState,
} from '@/features/products/productsSlice';
import { ALL_CATEGORIES } from '@/constants/categories';
import { CategoryBadge, StockBadge } from '@/components/common/Badge';
import Pagination from '@/components/common/Pagination';
import { TableSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';

import {
  HiOutlineSearch,
  HiOutlineQrcode,
  HiOutlineArrowLeft,
  HiOutlineRefresh,
  HiOutlinePencilAlt,
  HiOutlineEye,
  HiOutlineExclamationCircle,
  HiOutlinePhotograph,
} from 'react-icons/hi';

// ─── Mode toggle tabs ───────────────────────────────────────────────────────
const MODES = {
  SKU: 'sku',
  CATALOG: 'catalog',
};

const SearchPage = () => {
  const dispatch = useDispatch();

  // Redux state
  const { searchedProduct, isLookupLoading, lookupError } = useSelector(selectInventoryState);

  const {
    products,
    pagination,
    filters,
    isLoading: isCatalogLoading,
  } = useSelector(selectProductsState);

  // Local UI state
  const [mode, setMode] = useState(MODES.SKU);
  const [skuInput, setSkuInput] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const skuRef = useRef(null);

  // Focus SKU input on mode switch
  useEffect(() => {
    if (mode === MODES.SKU && skuRef.current) {
      skuRef.current.focus();
    }
  }, [mode]);

  // Load catalog on mount and whenever filters / page change
  useEffect(() => {
    if (mode === MODES.CATALOG) {
      dispatch(
        fetchProductsThunk({
          search: filters.search,
          category: filters.category,
          page: pagination.page,
          limit: 12,
          isActive: 'true',
        })
      );
    }
  }, [dispatch, mode, filters.search, filters.category, pagination.page]);

  // ── SKU Lookup ────────────────────────────────────────────────────────────
  const handleSkuLookup = (e) => {
    e.preventDefault();
    const sku = skuInput.trim();
    if (!sku) return;
    setHasSearched(true);
    dispatch(clearSearchedProduct());
    dispatch(lookupProductBySkuThunk(sku));
  };

  const handleSkuClear = () => {
    setSkuInput('');
    setHasSearched(false);
    dispatch(clearSearchedProduct());
    if (skuRef.current) skuRef.current.focus();
  };

  // ── Catalog Filters ───────────────────────────────────────────────────────
  const handleSearchChange = (e) => {
    dispatch(setProductFilters({ search: e.target.value }));
  };

  const handleCategoryChange = (e) => {
    dispatch(setProductFilters({ category: e.target.value }));
  };

  const handlePageChange = (page) => {
    dispatch(setProductPage(page));
  };

  const handleCatalogRefresh = () => {
    dispatch(
      fetchProductsThunk({
        search: filters.search,
        category: filters.category,
        page: pagination.page,
        limit: 12,
        isActive: 'true',
      })
    );
  };

  // Switch modes and reset relevant state
  const switchMode = (newMode) => {
    setMode(newMode);
    if (newMode === MODES.SKU) {
      dispatch(setProductFilters({ search: '', category: '' }));
      setHasSearched(false);
      dispatch(clearSearchedProduct());
    } else {
      handleSkuClear();
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/inventory"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-blue-600 mb-2 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span>Back to Inventory</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Product Search
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Scan a barcode / SKU for instant lookup, or browse the full catalog with filters.
          </p>
        </div>
      </div>

      {/* ── Mode Tabs ── */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          id="search-tab-sku"
          onClick={() => switchMode(MODES.SKU)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            mode === MODES.SKU
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <HiOutlineQrcode className="w-4 h-4" />
          SKU / Barcode Lookup
        </button>
        <button
          id="search-tab-catalog"
          onClick={() => switchMode(MODES.CATALOG)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            mode === MODES.CATALOG
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <HiOutlineSearch className="w-4 h-4" />
          Catalog Search
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODE A — SKU / BARCODE LOOKUP
          ══════════════════════════════════════════════════════════════════════ */}
      {mode === MODES.SKU && (
        <div className="space-y-6">
          {/* Search form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <HiOutlineQrcode className="w-5 h-5 text-blue-600" />
              Exact SKU / Barcode Lookup
            </h3>
            <form onSubmit={handleSkuLookup} className="flex items-center gap-3">
              <div className="flex-1 relative">
                <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={skuRef}
                  id="sku-lookup-input"
                  type="text"
                  value={skuInput}
                  onChange={(e) => setSkuInput(e.target.value)}
                  placeholder="Enter SKU or scan barcode… e.g. COLD-MILK-101"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono font-semibold placeholder:font-sans placeholder:font-normal"
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                disabled={isLookupLoading || !skuInput.trim()}
                id="sku-lookup-btn"
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isLookupLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <HiOutlineSearch className="w-4 h-4" />
                )}
                <span>Lookup</span>
              </button>
              {hasSearched && (
                <button
                  type="button"
                  onClick={handleSkuClear}
                  className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* Loading */}
          {isLookupLoading && (
            <div className="flex items-center justify-center gap-3 py-12 text-slate-400">
              <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              <span>Scanning SKU database…</span>
            </div>
          )}

          {/* Error / Not Found */}
          {!isLookupLoading && hasSearched && lookupError && (
            <div className="flex items-center gap-3 p-5 bg-rose-50 rounded-2xl border border-rose-200 text-rose-700">
              <HiOutlineExclamationCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">No Product Found</p>
                <p className="text-xs mt-0.5 text-rose-600">{lookupError}</p>
              </div>
            </div>
          )}

          {/* Result Card */}
          {!isLookupLoading && searchedProduct && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-emerald-50/60 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                  Product Found
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Image */}
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {searchedProduct.imageUrl ? (
                      <img
                        src={searchedProduct.imageUrl}
                        alt={searchedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <HiOutlinePhotograph className="w-10 h-10 text-slate-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-start gap-3">
                      <div>
                        <h2 className="text-xl font-extrabold text-slate-900">
                          {searchedProduct.name}
                        </h2>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">
                          SKU:{' '}
                          <span className="font-bold text-slate-700">{searchedProduct.sku}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <CategoryBadge category={searchedProduct.category} />
                        <StockBadge
                          quantity={searchedProduct.quantityInStock}
                          threshold={searchedProduct.reorderThreshold}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Price</p>
                        <p className="text-base font-extrabold text-slate-900 mt-0.5">
                          ${parseFloat(searchedProduct.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">In Stock</p>
                        <p className="text-base font-extrabold text-slate-900 mt-0.5">
                          {searchedProduct.quantityInStock} units
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Threshold</p>
                        <p className="text-base font-extrabold text-slate-900 mt-0.5">
                          {searchedProduct.reorderThreshold} units
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Value</p>
                        <p className="text-base font-extrabold text-slate-900 mt-0.5">
                          $
                          {(
                            parseFloat(searchedProduct.price) * searchedProduct.quantityInStock
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {searchedProduct.description && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {searchedProduct.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        to={`/inventory/${searchedProduct.id}`}
                        id="sku-result-view-btn"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                        View Details
                      </Link>
                      <Link
                        to={`/inventory/edit/${searchedProduct.id}`}
                        id="sku-result-edit-btn"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-colors"
                      >
                        <HiOutlinePencilAlt className="w-4 h-4" />
                        Edit Product
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty state (initial) */}
          {!hasSearched && !isLookupLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <HiOutlineQrcode className="w-16 h-16 mb-4 text-slate-200" />
              <p className="text-sm font-semibold text-slate-500">Enter a SKU or scan a barcode</p>
              <p className="text-xs mt-1 max-w-xs">
                Type the product's SKU code above and press Lookup for an instant match.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODE B — CATALOG SEARCH (paginated)
          ══════════════════════════════════════════════════════════════════════ */}
      {mode === MODES.CATALOG && (
        <div className="space-y-4">
          {/* Filters bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1 w-full">
              <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="catalog-search-input"
                type="text"
                value={filters.search}
                onChange={handleSearchChange}
                placeholder="Search by product name or SKU…"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Category filter */}
            <div className="w-full sm:w-52">
              <select
                id="catalog-category-filter"
                value={filters.category}
                onChange={handleCategoryChange}
                className="w-full py-2.5 px-3 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh */}
            <button
              id="catalog-refresh-btn"
              onClick={handleCatalogRefresh}
              disabled={isCatalogLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium shadow-sm transition-colors flex-shrink-0"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${isCatalogLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-slate-500 font-medium">
              {isCatalogLoading
                ? 'Searching…'
                : `${pagination.total} product${pagination.total !== 1 ? 's' : ''} found`}
            </p>
            {(filters.search || filters.category) && (
              <button
                onClick={() => dispatch(setProductFilters({ search: '', category: '' }))}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Results table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Product</th>
                    <th className="px-5 py-3.5">SKU</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Price</th>
                    <th className="px-5 py-3.5">Stock</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isCatalogLoading ? (
                    <tr>
                      <td colSpan="6" className="p-0">
                        <TableSkeleton rows={5} cols={6} />
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-0">
                        <EmptyState
                          icon={HiOutlineSearch}
                          title="No Matching Products"
                          description="No items found matching your active search keywords or category selection."
                          actionLabel={
                            filters.search || filters.category ? 'Clear Filters' : undefined
                          }
                          onAction={() => dispatch(setProductFilters({ search: '', category: '' }))}
                        />
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <HiOutlinePhotograph className="w-4 h-4 text-slate-300" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm line-clamp-1">
                                {p.name}
                              </p>
                              {p.description && (
                                <p className="text-[11px] text-slate-400 line-clamp-1 max-w-[200px]">
                                  {p.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                            {p.sku}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <CategoryBadge category={p.category} />
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">
                          ${parseFloat(p.price).toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5">
                          <StockBadge quantity={p.quantityInStock} threshold={p.reorderThreshold} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/inventory/${p.id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="View Details"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/inventory/edit/${p.id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Edit Product"
                            >
                              <HiOutlinePencilAlt className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
