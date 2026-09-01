/**
 * @file src/pages/ProductManagementPage.jsx
 * @description Product Catalog & Multi-Category Inventory management with dynamic category-specific fields, image upload, search, stock adjustments, and modals.
 */

import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

import {
  fetchProductsThunk,
  createProductThunk,
  updateProductThunk,
  updateProductStockThunk,
  deleteProductThunk,
  setProductFilters,
  setProductPage,
  selectProductsState,
} from '@/features/products/productsSlice';
import { CATEGORIES, ALL_CATEGORIES } from '@/constants/categories';
import { CategoryBadge, StockBadge } from '@/components/common/Badge';
import SearchInput from '@/components/common/SearchInput';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import { TableSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';

import {
  HiOutlinePlus,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineAdjustments,
  HiOutlinePhotograph,
  HiOutlineClock,
} from 'react-icons/hi';

// Form Validation Schema
const productSchema = yup.object().shape({
  sku: yup.string().required('SKU / Barcode is required').min(2),
  name: yup.string().required('Product Name is required').min(2),
  description: yup.string().optional(),
  category: yup.string().oneOf(ALL_CATEGORIES).required('Category is required'),
  price: yup
    .number()
    .typeError('Price must be a valid number')
    .positive('Price must be > 0')
    .required('Price is required'),
  quantityInStock: yup
    .number()
    .typeError('Stock must be an integer')
    .min(0, 'Cannot be negative')
    .required(),
  reorderThreshold: yup.number().typeError('Threshold must be an integer').min(0).required(),

  // Category Extension fields
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

const ProductManagementPage = () => {
  const dispatch = useDispatch();
  const { products, pagination, filters, isLoading, isActionLoading } =
    useSelector(selectProductsState);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [selectedProduct, setSelectedProductState] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  // Stock Adjustment State
  const [stockMode, setStockMode] = useState('add'); // 'add', 'deduct', 'set'
  const [stockQty, setStockQty] = useState(10);
  const [stockReason, setStockReason] = useState('Manual Restock');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      category: CATEGORIES.GENERAL,
      price: 19.99,
      quantityInStock: 20,
      reorderThreshold: 5,
      packagingMaterial: '',
      handlingInstructions: '',
      storageTemp: '2°C - 6°C',
      expiryDate: '',
      warrantyPeriodMonths: 12,
      serialNumber: '',
      hazardLevel: 'Low',
      safetyInstructions: '',
    },
  });

  const selectedCategory = watch('category');

  const loadProducts = () => {
    dispatch(
      fetchProductsThunk({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        category: filters.category,
        lowStock: filters.lowStock,
        isActive: filters.isActive,
      })
    );
  };

  useEffect(() => {
    loadProducts();
  }, [
    dispatch,
    pagination.page,
    filters.search,
    filters.category,
    filters.lowStock,
    filters.isActive,
  ]);

  // Image file handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Create Product Submit
  const handleCreateSubmit = async (data) => {
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
      toast.success(`Product '${data.name}' created successfully!`);
      setIsCreateModalOpen(false);
      reset();
      setImageFile(null);
      setImagePreview('');
    } else {
      toast.error(result.payload || 'Failed to create product');
    }
  };

  // Open Edit Modal
  const openEditModal = (product) => {
    setSelectedProductState(product);
    setImageFile(null);
    setImagePreview(product.imageUrl || '');

    reset({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      category: product.category,
      price: parseFloat(product.price),
      quantityInStock: product.quantityInStock,
      reorderThreshold: product.reorderThreshold,

      // Category Details
      packagingMaterial: product.fragileDetail?.packagingMaterial || '',
      handlingInstructions: product.fragileDetail?.handlingInstructions || '',

      storageTemp: product.coldDetail?.storageTemp || '',
      expiryDate: product.coldDetail?.expiryDate
        ? new Date(product.coldDetail.expiryDate).toISOString().slice(0, 10)
        : '',

      warrantyPeriodMonths: product.techDetail?.warrantyPeriodMonths || 12,
      serialNumber: product.techDetail?.serialNumber || '',

      hazardLevel: product.cleaningDetail?.hazardLevel || 'Low',
      safetyInstructions: product.cleaningDetail?.safetyInstructions || '',
    });

    setIsEditModalOpen(true);
  };

  // Edit Product Submit
  const handleEditSubmit = async (data) => {
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
        id: selectedProduct.id,
        formDataOrObject: formData,
      })
    );

    if (updateProductThunk.fulfilled.match(result)) {
      toast.success(`Product '${data.name}' updated!`);
      setIsEditModalOpen(false);
      setSelectedProductState(null);
      reset();
    } else {
      toast.error(result.payload || 'Failed to update product');
    }
  };

  // Open Stock Modal
  const openStockModal = (product) => {
    setSelectedProductState(product);
    setStockMode('add');
    setStockQty(10);
    setStockReason('Manual Restock');
    setIsStockModalOpen(true);
  };

  // Submit Stock Adjustment
  const handleStockSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      updateProductStockThunk({
        id: selectedProduct.id,
        stockData: {
          quantity: parseInt(stockQty, 10),
          action: stockMode,
          reason: stockReason,
        },
      })
    );

    if (updateProductStockThunk.fulfilled.match(result)) {
      toast.success(`Stock updated for ${selectedProduct.name}`);
      setIsStockModalOpen(false);
      setSelectedProductState(null);
      loadProducts();
    } else {
      toast.error(result.payload || 'Failed to adjust stock');
    }
  };

  // Delete / Soft-Deactivate
  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const result = await dispatch(deleteProductThunk(productToDelete.id));
    if (deleteProductThunk.fulfilled.match(result)) {
      toast.success(`Product '${productToDelete.name}' deactivated.`);
      setIsDeleteConfirmOpen(false);
      setProductToDelete(null);
    } else {
      toast.error(result.payload || 'Failed to deactivate product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Product Catalog &amp; Multi-Category Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Maintain multi-category specifications for Fragile, Cold, Tech, Cleaning, and General
            products.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadProducts}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
            aria-label="Refresh catalog"
          >
            <HiOutlineRefresh className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              reset();
              setImageFile(null);
              setImagePreview('');
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            <HiOutlinePlus className="w-5 h-5" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Category Tabs & Quick Filters */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => dispatch(setProductFilters({ category: '' }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filters.category === ''
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({pagination.total})
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => dispatch(setProductFilters({ category: cat }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filters.category === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Low Stock Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <SearchInput
            value={filters.search}
            onChange={(val) => dispatch(setProductFilters({ search: val }))}
            onClear={() => dispatch(setProductFilters({ search: '' }))}
            placeholder="Search by Name or SKU..."
            className="w-full sm:w-64"
          />

          <button
            onClick={() =>
              dispatch(
                setProductFilters({
                  lowStock: filters.lowStock === 'true' ? '' : 'true',
                })
              )
            }
            className={`px-3 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filters.lowStock === 'true'
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Low Stock</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">Product &amp; SKU</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Stock Status</th>
                <th className="px-5 py-4">Category Specs</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-0">
                    <TableSkeleton rows={6} cols={6} />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-0">
                    <EmptyState
                      title="No Products Found"
                      description="No catalog products match your search or category filter criteria."
                      actionLabel={
                        filters.search || filters.category || filters.lowStock
                          ? 'Clear Filters'
                          : undefined
                      }
                      onAction={() =>
                        dispatch(
                          setProductFilters({
                            search: '',
                            category: '',
                            lowStock: '',
                          })
                        )
                      }
                    />
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Product & SKU */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <HiOutlinePhotograph className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">
                            {p.name}
                          </p>
                          <p className="text-xs font-mono text-slate-400">{p.sku}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4">
                      <CategoryBadge category={p.category} />
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 font-bold text-slate-900">
                      ${parseFloat(p.price).toFixed(2)}
                    </td>

                    {/* Stock Status */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <StockBadge quantity={p.quantityInStock} threshold={p.reorderThreshold} />
                        <span className="text-[10px] text-slate-400">
                          Reorder at: {p.reorderThreshold} units
                        </span>
                      </div>
                    </td>

                    {/* Category Specifics */}
                    <td className="px-5 py-4 text-xs text-slate-500 max-w-[200px]">
                      {p.category === CATEGORIES.FRAGILE && p.fragileDetail && (
                        <div className="truncate">
                          <span className="font-semibold text-slate-700">Pkg: </span>
                          {p.fragileDetail.packagingMaterial}
                        </div>
                      )}
                      {p.category === CATEGORIES.COLD && p.coldDetail && (
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-700">
                              {p.coldDetail.storageTemp}
                            </span>
                          </div>
                          {p.coldDetail.isExpiringSoon && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 mt-0.5">
                              <HiOutlineClock className="w-3.5 h-3.5" />
                              Expiring in {p.coldDetail.daysUntilExpiry}d
                            </span>
                          )}
                        </div>
                      )}
                      {p.category === CATEGORIES.TECH && p.techDetail && (
                        <div className="truncate">
                          <span className="font-semibold text-slate-700">
                            {p.techDetail.warrantyPeriodMonths}m Warranty
                          </span>
                        </div>
                      )}
                      {p.category === CATEGORIES.CLEANING && p.cleaningDetail && (
                        <div>
                          <span className="font-semibold text-slate-700">Hazard: </span>
                          <span className="text-amber-700 font-semibold">
                            {p.cleaningDetail.hazardLevel}
                          </span>
                        </div>
                      )}
                      {p.category === CATEGORIES.GENERAL && (
                        <span className="text-slate-400">Standard dry good</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openStockModal(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Quick Stock Adjustment"
                        >
                          <HiOutlineAdjustments className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Product Details"
                        >
                          <HiOutlinePencilAlt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Deactivate Product"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => dispatch(setProductPage(page))}
        />
      </div>

      {/* CREATE PRODUCT MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Catalog Product"
        subtitle="Specify core retail pricing and dynamic category attributes."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-4">
          {/* Row 1: SKU & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SKU / Barcode *
              </label>
              <input
                type="text"
                placeholder="e.g. COLD-MILK-101"
                {...register('sku')}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
              />
              {errors.sku && <p className="text-xs text-rose-500 mt-1">{errors.sku.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Organic Whole Milk 1L"
                {...register('name')}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
            </div>
          </div>

          {/* Row 2: Category, Price, Initial Stock, Reorder Threshold */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium"
              >
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                {...register('price')}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Qty *</label>
              <input
                type="number"
                {...register('quantityInStock')}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alert Threshold *
              </label>
              <input
                type="number"
                {...register('reorderThreshold')}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* DYNAMIC CATEGORY ATTRIBUTES CARD */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <span>Category Specification: {selectedCategory}</span>
            </h4>

            {selectedCategory === CATEGORIES.FRAGILE && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Packaging Material *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bubble Wrap & Double Carton"
                    {...register('packagingMaterial')}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl outline-none"
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
                    placeholder="e.g. Do not stack higher than 2 units"
                    {...register('handlingInstructions')}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            )}

            {selectedCategory === CATEGORIES.COLD && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Storage Temperature *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2°C - 4°C"
                    {...register('storageTemp')}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl outline-none"
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
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl outline-none"
                  />
                  {errors.expiryDate && (
                    <p className="text-xs text-rose-500 mt-1">{errors.expiryDate.message}</p>
                  )}
                </div>
              </div>
            )}

            {selectedCategory === CATEGORIES.TECH && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Warranty (Months)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 24"
                    {...register('warrantyPeriodMonths')}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Serial Number / Batch
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SN-8849-TECH"
                    {...register('serialNumber')}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {selectedCategory === CATEGORIES.CLEANING && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hazard Level *
                  </label>
                  <select
                    {...register('hazardLevel')}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="Low">Low (Standard household)</option>
                    <option value="Medium">Medium (Irritant / Wear gloves)</option>
                    <option value="High">High (Corrosive / Ventilated only)</option>
                    <option value="Extreme">Extreme (Flammable / Hazmat)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Safety Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Keep away from heat sources"
                    {...register('safetyInstructions')}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            )}

            {selectedCategory === CATEGORIES.GENERAL && (
              <p className="text-xs text-slate-500">
                General products do not require specialized category compliance attributes.
              </p>
            )}
          </div>

          {/* Image Upload Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Image (Optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {imagePreview && (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isActionLoading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isActionLoading && (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              )}
              <span>Create Product</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT PRODUCT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Product: ${selectedProduct?.name}`}
        subtitle="Update catalog details and category parameters."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SKU / Barcode *
              </label>
              <input
                type="text"
                {...register('sku')}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                {...register('price')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Qty *</label>
              <input
                type="number"
                {...register('quantityInStock')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reorder Threshold *
              </label>
              <input
                type="number"
                {...register('reorderThreshold')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Dynamic Category fields for Edit */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <span className="text-xs font-bold text-slate-700">Category: {selectedCategory}</span>
            {selectedCategory === CATEGORIES.FRAGILE && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Packaging material"
                  {...register('packagingMaterial')}
                  className="px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Handling instructions"
                  {...register('handlingInstructions')}
                  className="px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl"
                />
              </div>
            )}
            {selectedCategory === CATEGORIES.COLD && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Storage Temp"
                  {...register('storageTemp')}
                  className="px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl"
                />
                <input
                  type="date"
                  {...register('expiryDate')}
                  className="px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isActionLoading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK STOCK ADJUSTMENT MODAL */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={`Adjust Stock: ${selectedProduct?.name}`}
        subtitle={`Current Inventory: ${selectedProduct?.quantityInStock} units`}
      >
        <form onSubmit={handleStockSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adjustment Action
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStockMode('add')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  stockMode === 'add'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                + Restock (Add)
              </button>
              <button
                type="button"
                onClick={() => setStockMode('deduct')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  stockMode === 'deduct'
                    ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                - Damage (Deduct)
              </button>
              <button
                type="button"
                onClick={() => setStockMode('set')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  stockMode === 'set'
                    ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                = Set Exact
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity ({stockMode === 'set' ? 'New Total' : 'Adjustment Amount'})
            </label>
            <input
              type="number"
              min="0"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Adjustment
            </label>
            <input
              type="text"
              value={stockReason}
              onChange={(e) => setStockReason(e.target.value)}
              placeholder="e.g. Supplier Shipment Received / Inventory Count"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsStockModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isActionLoading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/20"
            >
              Confirm Stock Update
            </button>
          </div>
        </form>
      </Modal>
      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Deactivate Product?"
        message={`Are you sure you want to deactivate '${productToDelete?.name}' (SKU: ${productToDelete?.sku})? It will no longer be available for POS scanning.`}
        confirmLabel="Deactivate Product"
        severity="danger"
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default ProductManagementPage;
