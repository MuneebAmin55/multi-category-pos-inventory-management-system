/**
 * @file src/pages/pos/components/CheckoutModal.jsx
 * @description Checkout modal for POS terminal featuring multi-payment methods, quick cash tender presets, live change calculation, and order submission.
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { processCheckoutThunk, selectCart, selectCartTotals } from '@/features/cart/cartSlice';
import Modal from '@/components/common/Modal';
import {
  HiOutlineCash,
  HiOutlineCreditCard,
  HiOutlineDeviceMobile,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';

const PAYMENT_METHODS = [
  {
    id: 'cash',
    label: 'Cash Tender',
    icon: HiOutlineCash,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-300',
  },
  {
    id: 'card',
    label: 'Credit / Debit',
    icon: HiOutlineCreditCard,
    color: 'text-blue-600 bg-blue-50 border-blue-300',
  },
  {
    id: 'mobile_payment',
    label: 'Digital / UPI',
    icon: HiOutlineDeviceMobile,
    color: 'text-purple-600 bg-purple-50 border-purple-300',
  },
];

const QUICK_CASH_PRESETS = [10, 20, 50, 100];

const CheckoutModal = ({ isOpen, onClose, onCheckoutSuccess }) => {
  const dispatch = useDispatch();
  const { isProcessingCheckout, checkoutError } = useSelector(selectCart);
  const { subtotal, taxRate, taxAmount, grandTotal, itemCount } = useSelector(selectCartTotals);

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashTendered, setCashTendered] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Default cash tendered to exact grand total whenever modal opens or total changes
  useEffect(() => {
    if (isOpen) {
      setCashTendered(grandTotal > 0 ? grandTotal.toFixed(2) : '');
      setPaymentMethod('cash');
    }
  }, [isOpen, grandTotal]);

  const tenderedAmount = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedAmount - grandTotal);
  const isUnderpaid = paymentMethod === 'cash' && tenderedAmount < grandTotal;

  const handleQuickCash = (amount) => {
    setCashTendered(amount.toString());
  };

  const handleExactCash = () => {
    setCashTendered(grandTotal.toFixed(2));
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (isUnderpaid) return;

    const result = await dispatch(
      processCheckoutThunk({
        paymentMethod,
        customerInfo: { notes: customerNotes },
      })
    );

    if (processCheckoutThunk.fulfilled.match(result)) {
      if (onCheckoutSuccess) {
        onCheckoutSuccess(result.payload);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete POS Checkout"
      subtitle={`Processing ${itemCount} items • Grand Total: $${grandTotal.toFixed(2)}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleCheckoutSubmit} className="space-y-5">
        {/* Total Display Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Amount Due
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-white mt-0.5">
              ${grandTotal.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Subtotal: ${subtotal.toFixed(2)} + Tax ({taxRate}%): ${taxAmount.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Live Verified
            </span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
            Select Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all text-center ${
                    isSelected
                      ? `${method.color} shadow-sm font-bold scale-[1.02]`
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-1.5" />
                  <span className="text-xs">{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash Tender Calculation Section */}
        {paymentMethod === 'cash' && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Cash Received ($)</label>
              <button
                type="button"
                onClick={handleExactCash}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
              >
                Exact Cash (${grandTotal.toFixed(2)})
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-lg font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                placeholder="0.00"
                required
                autoFocus
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] text-slate-400 font-semibold">Presets:</span>
              {QUICK_CASH_PRESETS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleQuickCash(amount)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-sm transition-colors"
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Live Change Indicator */}
            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">
                  Change Due to Customer:
                </span>
                {isUnderpaid ? (
                  <p className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-0.5">
                    <HiOutlineExclamationCircle className="w-4 h-4" />
                    Short by ${(grandTotal - tenderedAmount).toFixed(2)}
                  </p>
                ) : (
                  <p className="text-lg font-extrabold text-emerald-600 mt-0.5">
                    ${changeDue.toFixed(2)}
                  </p>
                )}
              </div>

              {!isUnderpaid && tenderedAmount >= grandTotal && (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                  <HiOutlineCheckCircle className="w-4 h-4" />
                  <span>Paid in Full</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card or Mobile Payment Notice */}
        {paymentMethod !== 'cash' && (
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-800 flex items-center gap-3">
            <HiOutlineCheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p>
              Please collect <strong>${grandTotal.toFixed(2)}</strong> via the{' '}
              {paymentMethod === 'card' ? 'Card POS Terminal / Reader' : 'Digital QR / UPI Scanner'}{' '}
              before confirming.
            </p>
          </div>
        )}

        {/* Error message */}
        {checkoutError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
            <HiOutlineExclamationCircle className="w-4 h-4 flex-shrink-0" />
            <span>{checkoutError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessingCheckout}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Back to Cart
          </button>

          <button
            type="submit"
            disabled={isProcessingCheckout || isUnderpaid || grandTotal <= 0}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isProcessingCheckout ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Processing Transaction...</span>
              </>
            ) : (
              <>
                <HiOutlineCheckCircle className="w-5 h-5" />
                <span>Charge ${grandTotal.toFixed(2)} &amp; Print</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CheckoutModal;
