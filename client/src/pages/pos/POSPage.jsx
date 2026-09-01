/**
 * @file src/pages/pos/POSPage.jsx
 * @description Primary POS Billing & Cashier Terminal. Tablet-friendly split-screen interface
 *   combining rapid barcode scanning, live multi-category product catalog browsing,
 *   touch quantity steppers, queue parking (hold cart), live tax calculations, and checkout.
 */

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  scanSkuThunk,
  addToCart,
  removeFromCart,
  updateQuantity,
  setTaxRate,
  clearCart,
  holdCurrentCart,
  resumeHeldCart,
  deleteHeldCart,
  selectCart,
  selectCartItems,
  selectCartTotals,
  selectHeldCarts,
  selectLastCompletedTransaction,
} from '@/features/cart/cartSlice';
import { fetchProductsThunk, selectProductsState } from '@/features/products/productsSlice';
import { selectUser } from '@/features/auth/authSlice';
import { ALL_CATEGORIES, CATEGORIES } from '@/constants/categories';
import { CategoryBadge } from '@/components/common/Badge';
import { ProductGridSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';

import CheckoutModal from './components/CheckoutModal';
import ReceiptModal from './components/ReceiptModal';
import RecentSalesDrawer from './components/RecentSalesDrawer';

import {
  HiOutlineQrcode,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineShoppingCart,
  HiOutlineClock,
  HiOutlinePause,
  HiOutlinePlay,
  HiOutlineRefresh,
  HiOutlinePhotograph,
  HiOutlineCurrencyDollar,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const POSPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  // Redux Cart State
  const cartItems = useSelector(selectCartItems);
  const { subtotal, taxRate, taxAmount, grandTotal, itemCount } = useSelector(selectCartTotals);
  const heldCarts = useSelector(selectHeldCarts);
  const lastCompletedTransaction = useSelector(selectLastCompletedTransaction);
  const { isScanning } = useSelector(selectCart);

  // Redux Catalog State
  const { products, isLoading: isCatalogLoading } = useSelector(selectProductsState);

  // Local UI State
  const [skuQuery, setSkuQuery] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeReceiptData, setActiveReceiptData] = useState(null);
  const [isRecentSalesOpen, setIsRecentSalesOpen] = useState(false);
  const [isHeldCartsDrawerOpen, setIsHeldCartsDrawerOpen] = useState(false);

  // Confirmation dialogs
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isHoldPromptOpen, setIsHoldPromptOpen] = useState(false);

  const skuInputRef = useRef(null);

  // Initial Load: Fetch active store catalog
  useEffect(() => {
    dispatch(
      fetchProductsThunk({
        limit: 100,
        page: 1,
        isActive: 'true',
      })
    );
  }, [dispatch]);

  // Focus barcode scanner on mount
  useEffect(() => {
    if (skuInputRef.current) {
      skuInputRef.current.focus();
    }
  }, []);

  // Keyboard Shortcuts (F2: New Sale / Focus Scanner, F4: Checkout)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        skuInputRef.current?.focus();
      } else if (e.key === 'F4' && cartItems.length > 0 && !isCheckoutOpen && !isReceiptOpen) {
        e.preventDefault();
        setIsCheckoutOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartItems.length, isCheckoutOpen, isReceiptOpen]);

  // Barcode / SKU Scan Handler
  const handleSkuScan = async (e) => {
    e.preventDefault();
    const sku = skuQuery.trim();
    if (!sku) return;

    await dispatch(scanSkuThunk(sku));
    setSkuQuery('');
    skuInputRef.current?.focus();
  };

  // Filter Catalog
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesSearch = catalogSearch
      ? p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(catalogSearch.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  // Cart Operations
  const handleAddToCart = (product) => {
    if (product.quantityInStock <= 0) {
      toast.error(`'${product.name}' is currently out of stock.`);
      return;
    }
    dispatch(addToCart({ product, quantity: 1 }));
  };

  const handleIncrement = (item) => {
    dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }));
  };

  const handleDecrement = (item) => {
    dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }));
  };

  const handleQuantityInputChange = (item, newQty) => {
    dispatch(updateQuantity({ productId: item.productId, quantity: parseInt(newQty, 10) || 0 }));
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleConfirmClearCart = () => {
    dispatch(clearCart());
    setIsClearConfirmOpen(false);
    toast.success('Cart cleared');
  };

  const handleConfirmHoldCart = (tag) => {
    const label = tag?.trim() || `Customer #${heldCarts.length + 1}`;
    dispatch(holdCurrentCart(label));
    setIsHoldPromptOpen(false);
  };

  const handleCheckoutSuccess = (receipt) => {
    setIsCheckoutOpen(false);
    setActiveReceiptData(receipt);
    setIsReceiptOpen(true);
  };

  const handleSelectRecentReceipt = (tx) => {
    setIsRecentSalesOpen(false);
    setActiveReceiptData({
      storeName: 'Mart POS & Retail',
      invoiceNumber: tx.invoiceNumber,
      date: tx.createdAt,
      cashier: tx.cashier,
      paymentMethod: tx.paymentMethod,
      items: tx.items,
      subtotal: tx.subtotal,
      taxRate: tx.taxRate,
      taxAmount: tx.taxAmount,
      grandTotal: tx.grandTotal,
    });
    setIsReceiptOpen(true);
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col space-y-3">
      {/* ── Top Bar: Cashier Session Toolbar ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <HiOutlineShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                POS Billing Terminal
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Live Register
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cashier:{' '}
              <span className="font-semibold text-slate-700">{user?.name || 'Counter Staff'}</span>{' '}
              • Counter #01
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Held Orders Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsHeldCartsDrawerOpen((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              heldCarts.length > 0
                ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <HiOutlinePause className="w-3.5 h-3.5" />
            <span>Held Orders ({heldCarts.length})</span>
          </button>

          {/* Recent Sales Trigger */}
          <button
            type="button"
            onClick={() => setIsRecentSalesOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <HiOutlineClock className="w-3.5 h-3.5 text-blue-600" />
            <span>Shift Sales</span>
          </button>

          {/* Quick Refresh Catalog */}
          <button
            type="button"
            onClick={() => dispatch(fetchProductsThunk({ limit: 100, page: 1, isActive: 'true' }))}
            disabled={isCatalogLoading}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh Catalog Stock"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isCatalogLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Main Split Screen: Left (Catalog & Scanner 65%) / Right (Live Cart 35%) ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* ══════════════════════════════════════════════════════════════════════
            LEFT PANEL: BARCODE SCANNER + PRODUCT CATALOG (8 Cols on LG)
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-3 min-h-0">
          {/* Scanner & Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3.5 space-y-3 flex-shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Barcode Scanner Input */}
              <form onSubmit={handleSkuScan} className="sm:col-span-7 relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                  <HiOutlineQrcode className="w-5 h-5 text-blue-600" />
                </div>
                <input
                  ref={skuInputRef}
                  type="text"
                  value={skuQuery}
                  onChange={(e) => setSkuQuery(e.target.value)}
                  placeholder="Scan SKU Barcode & press Enter (or F2)..."
                  className="w-full pl-11 pr-20 py-2.5 bg-slate-50 border-2 border-blue-200 focus:border-blue-600 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 focus:bg-white outline-none transition-all placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                  autoComplete="off"
                  aria-label="SKU Barcode Input"
                />
                <button
                  type="submit"
                  disabled={isScanning || !skuQuery.trim()}
                  className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-40 transition-colors shadow-sm"
                >
                  {isScanning ? 'Scanning...' : 'Scan'}
                </button>
              </form>

              {/* Product Catalog Text Search */}
              <div className="sm:col-span-5 relative flex items-center">
                <HiOutlineSearch className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Filter product by name..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  aria-label="Filter catalog products"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === ''
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Items ({products.length})
              </button>

              {ALL_CATEGORIES.map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Cards Touch Grid */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3.5 flex-1 overflow-y-auto min-h-0">
            {isCatalogLoading && products.length === 0 ? (
              <ProductGridSkeleton count={8} />
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                icon={HiOutlineSearch}
                title="No Products Found"
                description="No items match your active search or category filter."
                actionLabel="Clear Filters"
                onAction={() => {
                  setCatalogSearch('');
                  setSelectedCategory('');
                }}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => {
                  const isOutOfStock = product.quantityInStock <= 0;
                  const price = parseFloat(product.price) || 0;

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className={`flex flex-col text-left p-3 rounded-2xl border transition-all duration-150 group relative ${
                        isOutOfStock
                          ? 'border-slate-100 bg-slate-50/70 opacity-60 cursor-not-allowed'
                          : 'border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]'
                      }`}
                    >
                      {/* Product Image Thumbnail */}
                      <div className="w-full aspect-video rounded-xl bg-slate-100 overflow-hidden mb-2.5 flex items-center justify-center border border-slate-100">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <HiOutlinePhotograph className="w-8 h-8 text-slate-300" />
                        )}
                      </div>

                      {/* Name & SKU */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h4>
                        <p className="font-mono text-[10px] text-slate-400 mt-0.5">{product.sku}</p>
                      </div>

                      {/* Category Badge & Special Specs */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <CategoryBadge category={product.category} />
                        {product.category === CATEGORIES.COLD &&
                          product.coldDetail?.isExpiringSoon && (
                            <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                              Exp: {product.coldDetail.daysUntilExpiry}d
                            </span>
                          )}
                      </div>

                      {/* Price & Stock Row */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                        <span className="text-sm sm:text-base font-extrabold text-slate-900">
                          ${price.toFixed(2)}
                        </span>

                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold text-rose-600 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {product.quantityInStock} in stock
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            RIGHT PANEL: ACTIVE CART + LIVE TOTALS + CHECKOUT (4 Cols on LG)
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col min-h-0">
          {/* Cart Header */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <HiOutlineShoppingCart className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">
                Current Order ({itemCount} items)
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsHoldPromptOpen(true)}
                disabled={cartItems.length === 0}
                className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-100 disabled:opacity-40 transition-colors"
                title="Hold / Park this customer's cart"
                aria-label="Hold Order"
              >
                <HiOutlinePause className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(true)}
                disabled={cartItems.length === 0}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 disabled:opacity-40 transition-colors"
                title="Clear entire cart"
                aria-label="Clear Cart"
              >
                <HiOutlineTrash className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cart Line Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            {cartItems.length === 0 ? (
              <EmptyState
                icon={HiOutlineShoppingCart}
                title="Cart is Empty"
                description="Scan SKU barcode or tap products from catalog to start billing."
              />
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="p-2.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 shadow-sm flex items-center justify-between gap-3 transition-colors"
                >
                  {/* Item Description */}
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 truncate">{item.name}</h5>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      ${item.price.toFixed(2)} / unit • {item.sku}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => handleDecrement(item)}
                      aria-label="Decrease quantity"
                      className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-xs"
                    >
                      <HiOutlineMinus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityInputChange(item, e.target.value)}
                      className="w-8 text-center text-xs font-bold bg-transparent outline-none"
                      aria-label={`Quantity for ${item.name}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleIncrement(item)}
                      aria-label="Increase quantity"
                      className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-xs"
                    >
                      <HiOutlinePlus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="text-right flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900 whitespace-nowrap">
                      ${item.lineTotal.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.productId)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    >
                      <HiOutlineTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Financials Summary & Checkout Action Footer ── */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl space-y-3 flex-shrink-0">
            {/* Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <span>Store Tax:</span>
                  <select
                    value={taxRate}
                    onChange={(e) => dispatch(setTaxRate(e.target.value))}
                    className="text-[11px] font-bold bg-white border border-slate-200 rounded-md px-1.5 py-0.5 outline-none"
                  >
                    <option value="5.0">Standard (5.0%)</option>
                    <option value="0.0">Tax Exempt (0%)</option>
                    <option value="8.0">High Tax (8.0%)</option>
                    <option value="12.0">Luxury (12.0%)</option>
                  </select>
                </div>
                <span>${taxAmount.toFixed(2)}</span>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-slate-900">
                <span className="text-sm font-extrabold uppercase tracking-tight">Grand Total</span>
                <span className="text-2xl font-black text-slate-900">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cartItems.length === 0}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              <HiOutlineCurrencyDollar className="w-5 h-5" />
              <span>Charge &amp; Pay (${grandTotal.toFixed(2)}) [F4]</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── PARKED / HELD ORDERS SLIDE-OVER DRAWER ── */}
      {isHeldCartsDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsHeldCartsDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <HiOutlinePause className="w-5 h-5 text-amber-600" />
                  <span>Parked Customer Carts ({heldCarts.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHeldCartsDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                {heldCarts.length === 0 ? (
                  <EmptyState
                    icon={HiOutlinePause}
                    title="No Parked Orders"
                    description="When a customer steps away, click Hold Order to park their items here."
                  />
                ) : (
                  heldCarts.map((held) => (
                    <div
                      key={held.id}
                      className="p-4 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{held.label}</span>
                        <span className="text-[11px] text-slate-400">{held.savedAt}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {held.items.length} items • Total:{' '}
                        <strong>${held.grandTotal.toFixed(2)}</strong>
                      </p>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-100">
                        <button
                          type="button"
                          onClick={() => dispatch(deleteHeldCart(held.id))}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          Discard
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            dispatch(resumeHeldCart(held.id));
                            setIsHeldCartsDrawerOpen(false);
                          }}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                        >
                          <HiOutlinePlay className="w-3.5 h-3.5" />
                          <span>Resume Order</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CLEAR CART CONFIRMATION DIALOG ── */}
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleConfirmClearCart}
        title="Clear Active Shopping Cart?"
        message="This will remove all scanned and added line items from the current customer session."
        confirmLabel="Clear Cart"
        severity="danger"
      />

      {/* ── HOLD CART PROMPT DIALOG ── */}
      <ConfirmDialog
        isOpen={isHoldPromptOpen}
        onClose={() => setIsHoldPromptOpen(false)}
        onConfirm={handleConfirmHoldCart}
        title="Park Current Customer Cart"
        message="Enter an optional label or customer name to easily identify this parked order later."
        confirmLabel="Hold Order"
        severity="warning"
        inputPlaceholder={`Customer #${heldCarts.length + 1}`}
        inputDefaultValue={`Customer #${heldCarts.length + 1}`}
        inputLabel="Order / Customer Reference"
      />

      {/* ── CHECKOUT MODAL ── */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      {/* ── RECEIPT MODAL ── */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receiptData={activeReceiptData}
        onNewSale={() => {
          setIsReceiptOpen(false);
          setActiveReceiptData(null);
          skuInputRef.current?.focus();
        }}
      />

      {/* ── RECENT SHIFT SALES DRAWER ── */}
      <RecentSalesDrawer
        isOpen={isRecentSalesOpen}
        onClose={() => setIsRecentSalesOpen(false)}
        onSelectReceipt={handleSelectRecentReceipt}
      />
    </div>
  );
};

export default POSPage;
