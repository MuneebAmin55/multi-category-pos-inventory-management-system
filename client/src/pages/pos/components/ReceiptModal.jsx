/**
 * @file src/pages/pos/components/ReceiptModal.jsx
 * @description Authentic thermal receipt preview modal with print support and new sale action for POS checkout completion.
 */

import Modal from '@/components/common/Modal';
import {
  HiOutlinePrinter,
  HiOutlinePlusCircle,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

const ReceiptModal = ({ isOpen, onClose, receiptData, onNewSale }) => {
  if (!receiptData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleStartNewSale = () => {
    if (onNewSale) onNewSale();
    onClose();
  };

  const items = receiptData.items || [];
  const subtotal = parseFloat(receiptData.subtotal) || 0;
  const taxRate = parseFloat(receiptData.taxRate) || 5.0;
  const taxAmount = parseFloat(receiptData.taxAmount) || 0;
  const grandTotal = parseFloat(receiptData.grandTotal) || 0;
  const formattedDate = receiptData.date
    ? new Date(receiptData.date).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Receipt Generated"
      subtitle={`Invoice #${receiptData.invoiceNumber} • Ready for Printing`}
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Success Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3 text-emerald-800 text-xs no-print">
          <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Payment received successfully. Receipt ready for customer.</span>
        </div>

        {/* ── 80mm Thermal Receipt Container ── */}
        <div
          id="printable-receipt"
          className="bg-white border border-dashed border-slate-300 rounded-2xl p-6 shadow-sm font-mono text-slate-800 text-xs space-y-4 max-w-sm mx-auto"
        >
          {/* Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 font-sans">
              {receiptData.storeName || 'MART POS & RETAIL'}
            </h2>
            <p className="text-[10px] text-slate-500 font-sans">
              Main Store #01 • Multi-Category Inventory
            </p>
            <p className="text-[10px] text-slate-500 font-sans">
              Tel: +1 (555) 019-2834 • VAT / TAX ID: REG-994820
            </p>
          </div>

          {/* Transaction Metadata */}
          <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">INVOICE:</span>
              <span className="font-bold text-slate-900">{receiptData.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">DATE:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">CASHIER:</span>
              <span>{receiptData.cashier?.name || 'Counter Cashier'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">PAYMENT:</span>
              <span className="uppercase font-semibold text-slate-900">
                {receiptData.paymentMethod?.replace('_', ' ') || 'CASH'}
              </span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2 pb-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>Item Description</span>
              <span>Qty x Price</span>
              <span className="text-right">Total</span>
            </div>

            <div className="space-y-1.5 pt-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-[11px]">
                  <div className="max-w-[150px] leading-tight">
                    <p className="font-semibold text-slate-900 truncate">
                      {item.productNameSnapshot || item.name}
                    </p>
                    <span className="text-[9px] text-slate-400 font-sans">
                      SKU: {item.skuSnapshot || item.sku}
                    </span>
                  </div>
                  <div className="text-slate-500 whitespace-nowrap">
                    {item.quantity} × ${parseFloat(item.unitPrice || item.price).toFixed(2)}
                  </div>
                  <div className="font-bold text-slate-900 text-right whitespace-nowrap">
                    ${parseFloat(item.lineTotal || item.unitPrice * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-1 text-xs pt-1 pb-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax ({taxRate}%):</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
              <span>GRAND TOTAL:</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Barcode & Footer */}
          <div className="text-center space-y-2 pt-2">
            {/* Visual Simulated 1D Barcode */}
            <div className="flex justify-center items-center py-1">
              <div className="tracking-[6px] font-mono text-xl font-bold select-none text-slate-900">
                ||| | |||| | || ||| || ||||
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-sans">*{receiptData.invoiceNumber}*</p>
            <p className="text-[10px] text-slate-500 italic font-sans leading-relaxed pt-1">
              {receiptData.footerMessage ||
                'Thank you for shopping with us! Please retain this receipt for any warranty or return claims.'}
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 no-print">
          <button
            type="button"
            onClick={handleStartNewSale}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors"
          >
            <HiOutlinePlusCircle className="w-5 h-5 text-blue-600" />
            <span>New Sale (F2)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <HiOutlinePrinter className="w-5 h-5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
