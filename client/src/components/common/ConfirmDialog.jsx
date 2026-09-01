/**
 * @file src/components/common/ConfirmDialog.jsx
 * @description Accessible confirmation dialog replacing window.confirm() and prompt() with customizable severity, inputs, and loading states.
 */

import { useState, useEffect } from 'react';
import Modal from './Modal';
import {
  HiOutlineExclamation,
  HiOutlineTrash,
  HiOutlinePause,
  HiOutlineInformationCircle,
} from 'react-icons/hi';

const SEVERITY_CONFIG = {
  danger: {
    icon: HiOutlineTrash,
    iconColor: 'bg-rose-100 text-rose-600',
    buttonColor: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
  },
  warning: {
    icon: HiOutlineExclamation,
    iconColor: 'bg-amber-100 text-amber-700',
    buttonColor: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
  },
  info: {
    icon: HiOutlineInformationCircle,
    iconColor: 'bg-blue-100 text-blue-600',
    buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
  },
};

const ConfirmDialog = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  severity = 'danger',
  isLoading = false,
  inputPlaceholder,
  inputDefaultValue = '',
  inputLabel,
}) => {
  const [inputValue, setInputValue] = useState(inputDefaultValue);
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.danger;
  const Icon = config.icon;

  useEffect(() => {
    if (isOpen) {
      setInputValue(inputDefaultValue);
    }
  }, [isOpen, inputDefaultValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onConfirm) {
      onConfirm(inputValue);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${config.iconColor}`}
          >
            <Icon className="w-6 h-6" />
          </div>

          <div className="space-y-1 flex-1">
            <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Optional Input Field (e.g. for cart label tag) */}
        {inputPlaceholder !== undefined && (
          <div className="pt-2">
            {inputLabel && (
              <label className="block text-xs font-bold text-slate-700 mb-1">{inputLabel}</label>
            )}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputPlaceholder}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium text-slate-800"
              autoFocus
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {cancelLabel}
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 ${config.buttonColor} disabled:opacity-50`}
          >
            {isLoading && (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ConfirmDialog;
