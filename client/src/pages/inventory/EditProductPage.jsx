/**
 * @file src/pages/inventory/EditProductPage.jsx
 * @description Dedicated edit page for updating existing product attributes, replacing images, and adjusting category compliance fields.
 */

import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

import {
  fetchProductDetailsThunk,
  selectInventoryState,
} from '@/features/inventory/inventorySlice';
import { updateProductThunk, selectProductsState } from '@/features/products/productsSlice';
import { CATEGORIES, ALL_CATEGORIES } from '@/constants/categories';
import {
  HiOutlineArrowLeft,
  HiOutlinePhotograph,
  HiOutlineSparkles,
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

const EditProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentProduct, isLoading: isProductLoading } = useSelector(selectInventoryState);
  const { isActionLoading } = useSelector(selectProductsState);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productSchema),
  });

  const selectedCategory = watch('category');

  // Load product details on mount
  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetailsThunk(id));
    }
  }, [dispatch, id]);

  // Pre-populate form when product data is loaded
  useEffect(() => {
    if (currentProduct) {
      setImagePreview(currentProduct.imageUrl || '');
      reset({
        sku: currentProduct.sku,
        name: currentProduct.name,
        description: currentProduct.description || '',
        category: currentProduct.category,
        price: parseFloat(currentProduct.price),
        quantityInStock: currentProduct.quantityInStock,
        reorderThreshold: currentProduct.reorderThreshold,

        packagingMaterial: currentProduct.fragileDetail?.packagingMaterial || '',
        handlingInstructions: currentProduct.fragileDetail?.handlingInstructions || '',

        storageTemp: currentProduct.coldDetail?.storageTemp || '',
        expiryDate: currentProduct.coldDetail?.expiryDate
          ? new Date(currentProduct.coldDetail.expiryDate).toISOString().slice(0, 10)
          : '',

        warrantyPeriodMonths: currentProduct.techDetail?.warrantyPeriodMonths || 12,
        serialNumber: currentProduct.techDetail?.serialNumber || '',

        hazardLevel: currentProduct.cleaningDetail?.hazardLevel || 'Low',
        safetyInstructions: currentProduct.cleaningDetail?.safetyInstructions || '',
      });
    }
  }, [currentProduct, reset]);

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

    const result = await dispatch(
      updateProductThunk({
        id,
        formDataOrObject: formData,
      })
    );

    if (updateProductThunk.fulfilled.match(result)) {
      toast.success(`Product '${data.name}' updated successfully!`);
      navigate('/inventory');
    } else {
      toast.error(result.payload || 'Failed to update product');
    }
  };

  if (isProductLoading || !currentProduct) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <span>Loading product details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
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
            Edit Product: {currentProduct.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            SKU: <span className="font-mono font-bold text-slate-700">{currentProduct.sku}</span>{' '}
            &bull; Category: {currentProduct.category}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Core Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
            1. Core Retail Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SKU / Barcode *
              </label>
              <input
                type="text"
                {...register('sku')}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono font-semibold"
              />
              {errors.sku && <p className="text-xs text-rose-500 mt-1">{errors.sku.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              {...register('description')}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

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
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stock Quantity *
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

        {/* Image Upload Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
            2. Product Image
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
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
                Upload to replace current product image thumbnail.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Category Specifics */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <HiOutlineSparkles className="w-5 h-5 text-blue-600" />
              <span>3. Specialized Category Compliance: {selectedCategory}</span>
            </h3>
          </div>

          {selectedCategory === CATEGORIES.FRAGILE && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Packaging Material *
                </label>
                <input
                  type="text"
                  {...register('packagingMaterial')}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Handling Instructions
                </label>
                <input
                  type="text"
                  {...register('handlingInstructions')}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {selectedCategory === CATEGORIES.COLD && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Storage Temperature Range *
                </label>
                <input
                  type="text"
                  {...register('storageTemp')}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
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
              </div>
            </div>
          )}

          {selectedCategory === CATEGORIES.TECH && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Warranty Duration (Months)
                </label>
                <input
                  type="number"
                  {...register('warrantyPeriodMonths')}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Serial Number
                </label>
                <input
                  type="text"
                  {...register('serialNumber')}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none font-mono"
                />
              </div>
            </div>
          )}

          {selectedCategory === CATEGORIES.CLEANING && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hazard Level Classification *
                </label>
                <select
                  {...register('hazardLevel')}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none bg-white font-semibold"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Extreme">Extreme Hazmat</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Safety Instructions
                </label>
                <input
                  type="text"
                  {...register('safetyInstructions')}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
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
            <span>Update Product Details</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
