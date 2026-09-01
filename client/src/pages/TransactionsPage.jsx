/**
 * @file src/pages/TransactionsPage.jsx
 * @description Store Transactions Audit & Invoice Ledger with Date filters, Payment breakdown, and printable Retail Receipt modal.
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTransactionsThunk,
  fetchTransactionDetailsThunk,
  setTransactionFilters,
  setTransactionPage,
  clearSelectedTransaction,
  selectTransactionsState,
} from '@/features/transactions/transactionsSlice';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import { TableSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import {
  HiOutlineDocumentText,
  HiOutlinePrinter,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineCreditCard,
  HiOutlineCash,
  HiOutlineDeviceMobile,
} from 'react-icons/hi';

const TransactionsPage = () => {
  const dispatch = useDispatch();
  const { transactions, pagination, filters, selectedTransaction, isLoading, isDetailsLoading } =
    useSelector(selectTransactionsState);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadTransactions = () => {
    dispatch(
      fetchTransactionsThunk({
        page: pagination.page,
        limit: pagination.limit,
        startDate: filters.startDate,
        endDate: filters.endDate,
        paymentMethod: filters.paymentMethod,
      })
    );
  };

  useEffect(() => {
    loadTransactions();
  }, [dispatch, pagination.page, filters.startDate, filters.endDate, filters.paymentMethod]);

  const handleOpenReceipt = async (tx) => {
    setIsReceiptModalOpen(true);
    await dispatch(fetchTransactionDetailsThunk(tx.id));
  };

  const handlePrint = () => {
    window.print();
  };

  // Local filter for quick search by invoice number
  const filteredTransactions = transactions.filter((t) => {
    if (!searchTerm.trim()) return true;
    return t.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase().trim());
  });

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'card':
        return <HiOutlineCreditCard className="w-4 h-4 text-blue-600" />;
      case 'mobile_payment':
      case 'upi_digital':
        return <HiOutlineDeviceMobile className="w-4 h-4 text-purple-600" />;
      default:
        return <HiOutlineCash className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sales &amp; Transaction Audit
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete store invoice ledger, line item historical snapshots, and printable receipts.
          </p>
        </div>

        <button
          onClick={loadTransactions}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium shadow-sm transition-colors"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Transactions</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
        {/* Search by Invoice # */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <HiOutlineSearch className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Invoice Number (e.g. INV-2026...)"
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            aria-label="Search invoice number"
          />
        </div>

        {/* Payment Method Filter */}
        <div className="w-full md:w-44">
          <select
            value={filters.paymentMethod}
            onChange={(e) => dispatch(setTransactionFilters({ paymentMethod: e.target.value }))}
            className="w-full py-2 px-3 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            aria-label="Filter by payment type"
          >
            <option value="">All Payment Types</option>
            <option value="cash">Cash</option>
            <option value="card">Card / POS</option>
            <option value="mobile_payment">Digital / UPI</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="w-full md:w-40">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => dispatch(setTransactionFilters({ startDate: e.target.value }))}
            className="w-full py-1.5 px-3 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            aria-label="Filter by start date"
          />
        </div>

        {/* End Date */}
        <div className="w-full md:w-40">
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => dispatch(setTransactionFilters({ endDate: e.target.value }))}
            className="w-full py-1.5 px-3 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            aria-label="Filter by end date"
          />
        </div>

        {/* Clear Filters */}
        {(filters.startDate || filters.endDate || filters.paymentMethod || searchTerm) && (
          <button
            onClick={() => {
              dispatch(
                setTransactionFilters({
                  startDate: '',
                  endDate: '',
                  paymentMethod: '',
                })
              );
              setSearchTerm('');
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading && filteredTransactions.length === 0 ? (
            <TableSkeleton rows={6} cols={6} />
          ) : filteredTransactions.length === 0 ? (
            <EmptyState
              icon={HiOutlineDocumentText}
              title="No Invoices Found"
              description="No transactions match your current search or date range filters."
              actionLabel={
                filters.startDate || filters.endDate || filters.paymentMethod || searchTerm
                  ? 'Clear Filters'
                  : undefined
              }
              onAction={() => {
                dispatch(
                  setTransactionFilters({
                    startDate: '',
                    endDate: '',
                    paymentMethod: '',
                  })
                );
                setSearchTerm('');
              }}
            />
          ) : (
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4">Invoice #</th>
                  <th className="px-5 py-4">Cashier</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Subtotal</th>
                  <th className="px-5 py-4">Tax (5%)</th>
                  <th className="px-5 py-4">Grand Total</th>
                  <th className="px-5 py-4">Date &amp; Time</th>
                  <th className="px-5 py-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-blue-600">
                      {tx.invoiceNumber}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-900">
                      {tx.cashier?.name || 'Cashier'}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                        {getPaymentIcon(tx.paymentMethod)}
                        {tx.paymentMethod?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-600">
                      ${parseFloat(tx.subtotal).toFixed(2)}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-600">
                      ${parseFloat(tx.taxAmount).toFixed(2)}
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-900 text-base">
                      ${parseFloat(tx.grandTotal).toFixed(2)}
                    </td>

                    <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleOpenReceipt(tx)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold shadow-xs transition-colors"
                        title="View and print invoice receipt"
                      >
                        <HiOutlinePrinter className="w-4 h-4" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={(page) => dispatch(setTransactionPage(page))}
          />
        )}
      </div>

      {/* RECEIPT MODAL */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          dispatch(clearSelectedTransaction());
        }}
        title={`Invoice Receipt: ${selectedTransaction?.invoiceNumber || 'Loading...'}`}
        subtitle={`Transaction Record • Processed ${selectedTransaction?.createdAt ? new Date(selectedTransaction.createdAt).toLocaleString() : ''}`}
        maxWidth="max-w-md"
      >
        {isDetailsLoading || !selectedTransaction ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs">Loading invoice snapshot...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Printable Receipt Card */}
            <div
              id="printable-receipt"
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 font-mono text-xs text-slate-700 space-y-3"
            >
              {/* Header */}
              <div className="text-center border-b border-slate-200 pb-3">
                <h4 className="font-bold text-sm text-slate-900 font-sans uppercase">
                  Mart POS &amp; Retail
                </h4>
                <p className="text-[10px] text-slate-400 font-sans">
                  Invoice: {selectedTransaction.invoiceNumber}
                </p>
                <p className="text-[10px] text-slate-400 font-sans">
                  Cashier: {selectedTransaction.cashier?.name}
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 border-b border-slate-200 pb-3">
                <div className="flex justify-between font-bold text-[10px] uppercase text-slate-400">
                  <span>Item</span>
                  <span>Qty × Price</span>
                  <span>Total</span>
                </div>
                {selectedTransaction.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[140px]">
                      {item.productNameSnapshot || item.product?.name}
                    </span>
                    <span>
                      {item.quantity} × ${parseFloat(item.unitPrice).toFixed(2)}
                    </span>
                    <span className="font-bold">${parseFloat(item.lineTotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${parseFloat(selectedTransaction.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({selectedTransaction.taxRate}%):</span>
                  <span>${parseFloat(selectedTransaction.taxAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span>${parseFloat(selectedTransaction.grandTotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Payment Method:</span>
                  <span className="uppercase font-semibold text-slate-800">
                    {selectedTransaction.paymentMethod?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-2 text-[10px] text-slate-400 font-sans border-t border-slate-200">
                Thank you for your purchase!
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 no-print">
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
              >
                <HiOutlinePrinter className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TransactionsPage;
