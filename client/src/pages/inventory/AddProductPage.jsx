/**
 * @file src/pages/inventory/AddProductPage.jsx
 * @description Dedicated full-page creation portal for new products with auto-SKU generation, image upload, and dynamic category-specific compliance fields.
 */

import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

import { createProductThunk, selectProductsState } from '@/features/products/productsSlice';
import { CATEGORIES, ALL_CATEGORIES } from '@/constants/categories';
import {
  HiOutlineArrowLeft,
  HiOutlinePhotograph,
  HiOutlineSparkles,
  HiOutlineRefresh,
  HiOutlineTrash,
} from 'react-icons/hi';

const productSchema = yup.object().shape({
  sku: yup.string().required('SKU / Barcode is required').min(2),
  name: yup.string().required('Product Name is required').min(2),
  description: yup.string().optional(),
  category: yup.string().oneOf(ALL_CATEGORIES).required('Category is required'),
  price: yup
    .number()
    .typeError('Price must be a valid number')
    .positive('Price must be greater than 0')
    .required('Price is required'),
  quantityInStock: yup
    .number()
    .typeError('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .required(),
  reorderThreshold: yup.number().typeError('Threshold must be an integer').min(0).required(),

  // Category specific fields
  packagingMaterial: yup.string().when('category', {
    is: CATEGORIES.FRAGILE,
    then: (schema) => schema.required('Packaging material required for Fragile items'),
    otherwise: (schema) => schema.optional(),
  }),
  handlingInstructions: yup.string().optional(),

  storageTemp: yup.string().when('category', {
    is: CATEGORIES.COLD,
    then: (schema) => schema.required('Storage temperature required for Cold items'),
    otherwise: (schema) => schema.optional(),
  }),
  expiryDate: yup.string().when('category', {
    is: CATEGORIES.COLD,
    then: (schema) => schema.required('Expiry date required for Cold items'),
    otherwise: (schema) => schema.optional(),
  }),

  warrantyPeriodMonths: yup
    .number()
    .transform((c, o) => (o === '' ? undefined : c))
    .optional(),
  serialNumber: yup.string().optional(),

  hazardLevel: yup.string().when('category', {
    is: CATEGORIES.CLEANING,
    then: (schema) => schema.required('Hazard level is required for Cleaning items'),
    otherwise: (schema) => schema.optional(),
  }),
  safetyInstructions: yup.string().optional(),
});

const AddProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isActionLoading } = useSelector(selectProductsState);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      category: CATEGORIES.GENERAL,
      price: 9.99,
      quantityInStock: 25,
      reorderThreshold: 5,
      packagingMaterial: 'Bubble Cushion & Double Box',
      handlingInstructions: 'Handle with Care. Do not drop.',
      storageTemp: '2°C - 6°C',
      expiryDate: '',
      warrantyPeriodMonths: 12,
      serialNumber: '',
      hazardLevel: 'Low',
      safetyInstructions: 'Avoid direct eye contact.',
    },
  });

  const selectedCategory = watch('category');

  // Auto-generate unique SKU with prefix
  const handleAutoGenerateSku = () => {
    const prefixMap = {
      [CATEGORIES.FRAGILE]: 'FRAG',
      [CATEGORIES.COLD]: 'COLD',
      [CATEGORIES.TECH]: 'TECH',
      [CATEGORIES.CLEANING]: 'CLEAN',
      [CATEGORIES.GENERAL]: 'GEN',
    };
    const prefix = prefixMap[selectedCategory] || 'ITEM';
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newSku = `${prefix}-${randomCode}`;
    setValue('sku', newSku, { shouldValidate: true });
    toast.success(`Generated SKU: ${newSku}`);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const result = await dispatch(createProductThunk(formData));
    if (createProductThunk.fulfilled.match(result)) {
      toast.success(`Product '${data.name}' registered successfully!`);
      navigate('/inventory');
    } else {
      toast.error(result.payload || 'Failed to create product');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header with Back link */}
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
            Register New Product
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Specify retail pricing, inventory limits, and multi-category compliance rules.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Core Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
            1. Core Product &amp; Retail Pricing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* SKU with Auto-generate */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  SKU / Barcode *
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateSku}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  <HiOutlineRefresh className="w-3 h-3" />
                  <span>Auto-Generate</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. COLD-MILK-101"
                {...register('sku')}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono font-semibold"
              />
              {errors.sku && <p className="text-xs text-rose-500 mt-1">{errors.sku.message}</p>}
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Organic Almond Milk 1L"
                {...register('name')}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Product summary, packaging details, or origin..."
              {...register('description')}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Pricing & Stock Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-semibold text-slate-800"
              >
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Retail Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('price')}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold"
              />
              {errors.price && <p className="text-xs text-rose-500 mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Stock Qty *
              </label>
              <input
                type="number"
                {...register('quantityInStock')}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reorder Threshold *
              </label>
              <input
                type="number"
                {...register('reorderThreshold')}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Image Upload */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
            2. Product Image &amp; Media
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Uploaded preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    title="Remove Image"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <HiOutlinePhotograph className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="text-xs sm:text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              <p className="text-xs text-slate-400">
                Supports PNG, JPG, or WebP up to 5MB. Stored locally via Multer storage.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Dynamic Category-Specific Compliance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <HiOutlineSparkles className="w-5 h-5 text-blue-600" />
              <span>3. Specialized Category Compliance: {selectedCategory}</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Active Category Schema
            </span>
          </div>

          {/* Fragile Goods */}
          {selectedCategory === CATEGORIES.FRAGILE && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Packaging Material *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Molded Styrofoam & Bubble Wrap"
                  {...register('packagingMaterial')}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
                {errors.packagingMaterial && (
                  <p className="text-xs text-rose-500 mt-1">{errors.packagingMaterial.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Handling Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fragile Glassware. Do not invert."
                  {...register('handlingInstructions')}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Cold / Perishable */}
          {selectedCategory === CATEGORIES.COLD && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Storage Temperature Range *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1°C - 4°C"
                  {...register('storageTemp')}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
                {errors.storageTemp && (
                  <p className="text-xs text-rose-500 mt-1">{errors.storageTemp.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  {...register('expiryDate')}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
                {errors.expiryDate && (
                  <p className="text-xs text-rose-500 mt-1">{errors.expiryDate.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Tech / Hardware */}
          {selectedCategory === CATEGORIES.TECH && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Warranty Duration (Months)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 12 or 24"
                  {...register('warrantyPeriodMonths')}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Serial Number / Hardware Batch
                </label>
                <input
                  type="text"
                  placeholder="e.g. SN-9948-TECH"
                  {...register('serialNumber')}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
                />
              </div>
            </div>
          )}

          {/* Cleaning / Chemicals */}
          {selectedCategory === CATEGORIES.CLEANING && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hazard Level Classification *
                </label>
                <select
                  {...register('hazardLevel')}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-semibold"
                >
                  <option value="Low">Low (Standard household)</option>
                  <option value="Medium">Medium (Skin Irritant / Wear Gloves)</option>
                  <option value="High">High (Corrosive / Ventilated Area)</option>
                  <option value="Extreme">Extreme (Flammable / Hazmat Protocols)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Safety Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Keep away from flammable sources and open flames"
                  {...register('safetyInstructions')}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* General */}
          {selectedCategory === CATEGORIES.GENERAL && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
              General merchandise adheres to standard retail inventory parameters. No extended
              compliance attributes are required.
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/inventory"
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isActionLoading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isActionLoading && (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            )}
            <span>Save &amp; Register Product</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;
