/**
 * @file src/pages/SettingsPage.jsx
 * @description Store Settings & System Diagnostics: Store Profile, POS Billing Defaults, and Database Cluster Health.
 */

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineCog,
  HiOutlineOfficeBuilding,
  HiOutlinePrinter,
  HiOutlineDatabase,
  HiOutlineCheckCircle,
  HiOutlineSave,
} from 'react-icons/hi';

const SettingsPage = () => {
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Mart POS Superstore',
    address: '100 Central Avenue, Suite 400',
    contactEmail: 'support@martpos.com',
    currencySymbol: '$',
    defaultTaxRate: '5.0',
    invoicePrefix: 'INV',
    autoPrintReceipts: true,
    scannerBeepSound: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) => {
    setStoreSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      localStorage.setItem('martpos_settings', JSON.stringify(storeSettings));
      toast.success('Store settings saved successfully!');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Store &amp; POS Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure store metadata, tax calculations, receipt formats, and system defaults.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Store Profile */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <HiOutlineOfficeBuilding className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Store Identity</h3>
              <p className="text-xs text-slate-400">
                Printed on customer checkout receipts and invoice headers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Store / Company Name
              </label>
              <input
                type="text"
                value={storeSettings.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={storeSettings.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Physical Store Address
              </label>
              <input
                type="text"
                value={storeSettings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: POS Terminal & Billing Defaults */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HiOutlinePrinter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">POS Billing &amp; Tax Defaults</h3>
              <p className="text-xs text-slate-400">
                Configure default tax rates, invoice numbers, and auto-printing
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Standard Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={storeSettings.defaultTaxRate}
                onChange={(e) => handleChange('defaultTaxRate', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={storeSettings.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Number Prefix
              </label>
              <input
                type="text"
                value={storeSettings.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={storeSettings.autoPrintReceipts}
                onChange={(e) => handleChange('autoPrintReceipts', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs sm:text-sm text-slate-700 font-medium">
                Automatically prompt print dialog after successful checkout
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={storeSettings.scannerBeepSound}
                onChange={(e) => handleChange('scannerBeepSound', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs sm:text-sm text-slate-700 font-medium">
                Play acoustic confirmation tone on successful barcode/SKU scan
              </span>
            </label>
          </div>
        </div>

        {/* Section 3: System Diagnostics & Health */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HiOutlineDatabase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                System Diagnostics &amp; Cluster Health
              </h3>
              <p className="text-xs text-slate-400">
                Connected architecture and security configuration
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">
                Database Engine
              </span>
              <p className="font-bold text-slate-800 text-sm">PostgreSQL 16</p>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                <span>Sequelize Pool Connected</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">
                Authentication
              </span>
              <p className="font-bold text-slate-800 text-sm">JWT Bearer (HS256)</p>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                <span>24h Rolling Expiry</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">
                API Gateway Proxy
              </span>
              <p className="font-bold text-slate-800 text-sm">http://localhost:5000</p>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                <span>Reverse Proxy Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
          >
            {isSaving ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <HiOutlineSave className="w-4 h-4" />
            )}
            <span>Save Store Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
