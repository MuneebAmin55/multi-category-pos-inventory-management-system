/**
 * @file services/product.service.js
 * @description Business logic for Product catalog, category extensions, search, and stock management.
 */

const { Op, Sequelize } = require('sequelize');
const {
  sequelize,
  Product,
  FragileDetail,
  ColdDetail,
  TechDetail,
  CleaningDetail,
} = require('../models');
const { CATEGORIES } = require('../constants/categories.constant');
const { enrichProductExpiryInfo } = require('../helpers/expiryChecker.helper');
const ApiError = require('../utils/apiError');

/**
 * Standard include options for eager-loading category extension models.
 */
const categoryIncludes = [
  { model: FragileDetail, as: 'fragileDetail' },
  { model: ColdDetail, as: 'coldDetail' },
  { model: TechDetail, as: 'techDetail' },
  { model: CleaningDetail, as: 'cleaningDetail' },
];

/**
 * List products with multi-criteria search, filters, low-stock detection, and pagination.
 */
const listProducts = async ({
  search = '',
  category,
  lowStock,
  expiringSoon,
  isActive,
  page = 1,
  limit = 10,
}) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  const where = {};

  // Case-insensitive search on Name or SKU
  if (search && search.trim() !== '') {
    const trimmedSearch = search.trim();
    where[Op.or] = [
      { name: { [Op.iLike]: `%${trimmedSearch}%` } },
      { sku: { [Op.iLike]: `%${trimmedSearch}%` } },
    ];
  }

  // Filter by category
  if (category) {
    where.category = category;
  }

  // Filter by active status (default to active only unless specified)
  if (isActive !== undefined && isActive !== '') {
    where.isActive = isActive === 'true' || isActive === true;
  }

  // Filter by low stock condition (quantityInStock <= reorderThreshold)
  if (lowStock === 'true' || lowStock === true) {
    where[Op.and] = [
      Sequelize.where(
        Sequelize.col('Product.quantity_in_stock'),
        '<=',
        Sequelize.col('Product.reorder_threshold')
      ),
    ];
  }

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: categoryIncludes,
    limit: limitNum,
    offset,
    order: [['createdAt', 'DESC']],
    distinct: true, // Required for accurate count with includes
  });

  // Enrich cold products with expiry warnings
  let enrichedRows = rows.map((p) => enrichProductExpiryInfo(p));

  // If expiringSoon filter requested, filter enriched cold products
  if (expiringSoon === 'true' || expiringSoon === true) {
    enrichedRows = enrichedRows.filter(
      (p) => p.category === CATEGORIES.COLD && p.coldDetail && p.coldDetail.isExpiringSoon
    );
  }

  return {
    products: enrichedRows,
    pagination: {
      total: count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(count / limitNum) || 1,
    },
  };
};

/**
 * Retrieve product by ID with category extension details.
 */
const getProductById = async (productId) => {
  const product = await Product.findByPk(productId, {
    include: categoryIncludes,
  });

  if (!product) {
    throw ApiError.notFound(`Product with ID '${productId}' not found.`);
  }

  return enrichProductExpiryInfo(product);
};

/**
 * Retrieve product by exact SKU for POS / scanner lookup.
 */
const getProductBySku = async (sku) => {
  const product = await Product.findOne({
    where: {
      sku: { [Op.iLike]: sku.trim() },
      isActive: true,
    },
    include: categoryIncludes,
  });

  if (!product) {
    throw ApiError.notFound(`Product with SKU '${sku}' not found or inactive.`);
  }

  return enrichProductExpiryInfo(product);
};

/**
 * Create a new product with category-specific extension attributes in a managed transaction.
 */
const createProduct = async (productData, file) => {
  const {
    sku,
    name,
    description,
    category,
    price,
    quantityInStock,
    reorderThreshold,
    // Fragile
    handlingNote,
    isFragile,
    // Cold
    expiryDate,
    storageTemp,
    // Tech
    warrantyPeriod,
    serialNumber,
    // Cleaning
    isHazardous,
    safetyNote,
  } = productData;

  // Check unique SKU
  const existingSku = await Product.findOne({ where: { sku } });
  if (existingSku) {
    throw ApiError.conflict(`A product with SKU '${sku}' already exists.`);
  }

  // Normalize category to lowercase (handle title case from frontend)
  const normalizedCategory = category ? category.toLowerCase() : CATEGORIES.GENERAL;

  // If Tech category, verify unique serialNumber
  if (normalizedCategory === CATEGORIES.TECH && serialNumber) {
    const existingSerial = await TechDetail.findOne({ where: { serialNumber } });
    if (existingSerial) {
      throw ApiError.conflict(
        `A tech product with serial number '${serialNumber}' already exists.`
      );
    }
  }

  const imageUrl = file ? `/uploads/${file.filename}` : productData.imageUrl || null;

  // Execute in managed Sequelize transaction
  const result = await sequelize.transaction(async (t) => {
    const newProduct = await Product.create(
      {
        sku,
        name,
        description,
        category: normalizedCategory,
        price,
        quantityInStock: quantityInStock || 0,
        reorderThreshold: reorderThreshold || 5,
        imageUrl,
        isActive: true,
      },
      { transaction: t }
    );

    // Create corresponding 1:1 category details
    if (normalizedCategory === CATEGORIES.FRAGILE) {
      await FragileDetail.create(
        {
          productId: newProduct.id,
          handlingNote,
          isFragile: isFragile !== undefined ? isFragile : true,
        },
        { transaction: t }
      );
    } else if (normalizedCategory === CATEGORIES.COLD) {
      await ColdDetail.create(
        {
          productId: newProduct.id,
          expiryDate,
          storageTemp,
        },
        { transaction: t }
      );
    } else if (normalizedCategory === CATEGORIES.TECH) {
      await TechDetail.create(
        {
          productId: newProduct.id,
          warrantyPeriod: warrantyPeriod || 0,
          serialNumber,
        },
        { transaction: t }
      );
    } else if (normalizedCategory === CATEGORIES.CLEANING) {
      await CleaningDetail.create(
        {
          productId: newProduct.id,
          isHazardous: isHazardous || false,
          safetyNote,
        },
        { transaction: t }
      );
    }

    return newProduct;
  });

  return getProductById(result.id);
};

/**
 * Update an existing product and its category extension record.
 */
const updateProduct = async (productId, updateData, file) => {
  const product = await Product.findByPk(productId, {
    include: categoryIncludes,
  });

  if (!product) {
    throw ApiError.notFound(`Product with ID '${productId}' not found.`);
  }

  // If SKU is changed, check uniqueness
  if (updateData.sku && updateData.sku !== product.sku) {
    const existing = await Product.findOne({ where: { sku: updateData.sku } });
    if (existing) {
      throw ApiError.conflict(`A product with SKU '${updateData.sku}' already exists.`);
    }
  }

  const imageUrl = file ? `/uploads/${file.filename}` : updateData.imageUrl;

  await sequelize.transaction(async (t) => {
    // 1. Update Base Product Attributes
    if (updateData.sku) product.sku = updateData.sku;
    if (updateData.name) product.name = updateData.name;
    if (updateData.description !== undefined) product.description = updateData.description;
    if (updateData.price !== undefined) product.price = updateData.price;
    if (updateData.quantityInStock !== undefined)
      product.quantityInStock = updateData.quantityInStock;
    if (updateData.reorderThreshold !== undefined)
      product.reorderThreshold = updateData.reorderThreshold;
    if (updateData.isActive !== undefined) product.isActive = updateData.isActive;
    if (imageUrl !== undefined) product.imageUrl = imageUrl;

    await product.save({ transaction: t });

    // 2. Update Category Details based on category
    if (product.category === CATEGORIES.FRAGILE) {
      const fragileData = {
        handlingNote: updateData.handlingNote,
        isFragile: updateData.isFragile,
      };
      if (product.fragileDetail) {
        await product.fragileDetail.update(fragileData, { transaction: t });
      } else {
        await FragileDetail.create({ productId: product.id, ...fragileData }, { transaction: t });
      }
    } else if (product.category === CATEGORIES.COLD) {
      const coldData = {
        expiryDate: updateData.expiryDate,
        storageTemp: updateData.storageTemp,
      };
      if (product.coldDetail) {
        await product.coldDetail.update(coldData, { transaction: t });
      } else {
        await ColdDetail.create({ productId: product.id, ...coldData }, { transaction: t });
      }
    } else if (product.category === CATEGORIES.TECH) {
      const techData = {
        warrantyPeriod: updateData.warrantyPeriod,
        serialNumber: updateData.serialNumber,
      };
      if (product.techDetail) {
        await product.techDetail.update(techData, { transaction: t });
      } else {
        await TechDetail.create({ productId: product.id, ...techData }, { transaction: t });
      }
    } else if (product.category === CATEGORIES.CLEANING) {
      const cleanData = {
        isHazardous: updateData.isHazardous,
        safetyNote: updateData.safetyNote,
      };
      if (product.cleaningDetail) {
        await product.cleaningDetail.update(cleanData, { transaction: t });
      } else {
        await CleaningDetail.create({ productId: product.id, ...cleanData }, { transaction: t });
      }
    }
  });

  return getProductById(product.id);
};

/**
 * Direct Stock Update / Adjustment API.
 */
const updateProductStock = async (productId, { quantityInStock, adjustment }) => {
  const product = await Product.findByPk(productId);
  if (!product) {
    throw ApiError.notFound(`Product with ID '${productId}' not found.`);
  }

  let newQuantity;
  if (quantityInStock !== undefined) {
    newQuantity = parseInt(quantityInStock, 10);
  } else if (adjustment !== undefined) {
    newQuantity = product.quantityInStock + parseInt(adjustment, 10);
  }

  if (newQuantity < 0) {
    throw ApiError.badRequest(
      `Insufficient stock. Adjustment would reduce stock to ${newQuantity}, which is below 0.`
    );
  }

  product.quantityInStock = newQuantity;
  await product.save();

  return {
    productId: product.id,
    sku: product.sku,
    name: product.name,
    previousStock: product.previous('quantityInStock'),
    quantityInStock: product.quantityInStock,
    isLowStock: product.quantityInStock <= product.reorderThreshold,
  };
};

/**
 * Soft-delete / Deactivate product.
 */
const deleteProduct = async (productId) => {
  const product = await Product.findByPk(productId);
  if (!product) {
    throw ApiError.notFound(`Product with ID '${productId}' not found.`);
  }

  product.isActive = false;
  await product.save();

  return { id: product.id, name: product.name, isActive: false };
};

/**
 * List all products currently below or at their reorder threshold.
 */
const getLowStockProducts = async ({ page = 1, limit = 10 }) => {
  return listProducts({ lowStock: true, page, limit });
};

module.exports = {
  listProducts,
  getProductById,
  getProductBySku,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  getLowStockProducts,
};
