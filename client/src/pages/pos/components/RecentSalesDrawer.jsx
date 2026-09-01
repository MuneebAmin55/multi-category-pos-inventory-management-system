/**
 * @file src/pages/pos/components/RecentSalesDrawer.jsx
 * @description Slide-over drawer for Cashiers to inspect their latest shift transactions and trigger fast receipt reprints.
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTransactionsThunk,
  fetchTransactionDetailsThunk,
  selectTransactionsState,
} from '@/features/transactions/transactionsSlice';
import {
  HiOutlineX,
  HiOutlineRefresh,
  HiOutlinePrinter,
  HiOutlineCash,
  HiOutlineCreditCard,
  HiOutlineDeviceMobile,
  HiOutlineDocumentText,
} from 'react-icons/hi';

const RecentSalesDrawer = ({ isOpen, onClose, onSelectReceipt }) => {
  const dispatch = useDispatch();
  const { transactions, isLoading } = useSelector(selectTransactionsState);

  const loadRecentSales = () => {
    dispatch(fetchTransactionsThunk({ limit: 12, page: 1, isCashierOnly: true }));
  };

  useEffect(() => {
    if (isOpen) {
      loadRecentSales();
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  const handleInspect = async (tx) => {
    const res = await dispatch(fetchTransactionDetailsThunk(tx.id));
    if (fetchTransactionDetailsThunk.fulfilled.match(res) && onSelectReceipt) {
      onSelectReceipt(res.payload);
    }
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'card':
        return <HiOutlineCreditCard className="w-3.5 h-3.5 text-blue-600" />;
      case 'mobile_payment':
      case 'upi_digital':
        return <HiOutlineDeviceMobile className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <HiOutlineCash className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HiOutlineDocumentText className="w-5 h-5 text-blue-600" />
                <span>Recent Shift Transactions</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Past sales from your active counter session
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={loadRecentSales}
                disabled={isLoading}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                title="Refresh sales list"
              >
                <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading && transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
                <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <span className="text-xs">Loading shift records...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <HiOutlineDocumentText className="w-12 h-12 text-slate-200 mb-2" />
                <p className="text-sm font-semibold text-slate-600">No Sales Processed Yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Transactions completed in this shift will appear here for instant reprint.
                </p>
              </div>
            ) : (
              transactions.map((tx) => {
                const total = parseFloat(tx.grandTotal) || 0;
                const itemsCount = tx.items?.length || 0;
                const dateStr = new Date(tx.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {tx.invoiceNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{dateStr}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700">
                          {getPaymentIcon(tx.paymentMethod)}
                          <span className="capitalize">{tx.paymentMethod?.replace('_', ' ')}</span>
                        </span>
                        <span className="text-slate-500 font-medium">
                          {itemsCount} item{itemsCount !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <span className="text-sm font-extrabold text-slate-900">
                        ${total.toFixed(2)}
                      </span>
                    </div>

                    <div className="pt-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleInspect(tx)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                      >
                        <HiOutlinePrinter className="w-3.5 h-3.5" />
                        <span>View / Re-Print Receipt</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentSalesDrawer;
