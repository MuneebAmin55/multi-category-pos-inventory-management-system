/**
 * @file services/stats.service.js
 * @description Service layer for sales metrics, dashboard summaries, and reporting aggregations.
 */

const { Op, fn, col, literal, QueryTypes } = require('sequelize');
const { sequelize, Transaction, TransactionItem, Product, User } = require('../models');

// ============================================================================
// Shared Date Utilities
// ============================================================================

/** Get today's date boundaries (midnight to 23:59:59.999) */
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/** Get date range for N days ago through today */
const _getLastNDaysRange = (days) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

// ============================================================================
// 1. Dashboard Summary (Admin view)
// ============================================================================

/**
 * Comprehensive dashboard stats for Admin:
 * - Today's revenue and transaction count
 * - All-time revenue and transaction count
 * - Total active products / low-stock count
 * - Total active staff
 * - Revenue trend for the past 7 days
 */
const getAdminDashboardSummary = async () => {
  const { start: todayStart, end: todayEnd } = getTodayRange();

  // ---- Today's Sales ----
  const todaySales = await Transaction.findAll({
    where: { createdAt: { [Op.between]: [todayStart, todayEnd] } },
    attributes: [
      [fn('COUNT', col('id')), 'transactionCount'],
      [fn('SUM', col('grand_total')), 'totalRevenue'],
    ],
    raw: true,
  });

  const todayRevenue = parseFloat(todaySales[0]?.totalRevenue || 0);
  const todayTransactionCount = parseInt(todaySales[0]?.transactionCount || 0, 10);

  // ---- All-Time Totals ----
  const allTimeSales = await Transaction.findAll({
    attributes: [
      [fn('COUNT', col('id')), 'transactionCount'],
      [fn('SUM', col('grand_total')), 'totalRevenue'],
    ],
    raw: true,
  });

  const allTimeRevenue = parseFloat(allTimeSales[0]?.totalRevenue || 0);
  const allTimeTransactionCount = parseInt(allTimeSales[0]?.transactionCount || 0, 10);

  // ---- Product Counts ----
  const totalProducts = await Product.count({ where: { isActive: true } });

  const lowStockCount = await Product.count({
    where: {
      isActive: true,
      [Op.and]: [
        literal('"Product"."quantity_in_stock" <= "Product"."reorder_threshold"'),
      ],
    },
  });

  // ---- Staff Counts ----
  const totalActiveStaff = await User.count({ where: { isActive: true } });

  // ---- 7-Day Revenue Trend ----
  const sevenDayRevenueTrend = await sequelize.query(
    `
    SELECT
      DATE(created_at AT TIME ZONE 'UTC') AS date,
      COUNT(id)::int AS transaction_count,
      COALESCE(SUM(grand_total), 0)::float AS revenue
    FROM transactions
    WHERE created_at >= NOW() - INTERVAL '7 days'
    GROUP BY DATE(created_at AT TIME ZONE 'UTC')
    ORDER BY date ASC
    `,
    { type: QueryTypes.SELECT }
  );

  return {
    today: {
      revenue: todayRevenue,
      transactionCount: todayTransactionCount,
    },
    allTime: {
      revenue: allTimeRevenue,
      transactionCount: allTimeTransactionCount,
    },
    inventory: {
      totalActiveProducts: totalProducts,
      lowStockAlertCount: lowStockCount,
    },
    staff: {
      totalActiveStaff,
    },
    revenueChart: {
      label: 'Last 7 Days Revenue',
      data: sevenDayRevenueTrend,
    },
  };
};

// ============================================================================
// 2. Inventory Dashboard Statistics (Inventory Manager view)
// ============================================================================

/**
 * Inventory-focused stats for Inventory Manager:
 * - Total products / active vs inactive
 * - Category breakdown
 * - Low-stock count and list
 * - Cold items expiring within 3 days
 */
const getInventoryDashboardStats = async () => {
  // ---- Product Status Counts ----
  const totalProducts = await Product.count();
  const activeProducts = await Product.count({ where: { isActive: true } });
  const inactiveProducts = totalProducts - activeProducts;

  // ---- Category Breakdown ----
  const categoryBreakdown = await Product.findAll({
    where: { isActive: true },
    attributes: ['category', [fn('COUNT', col('id')), 'count']],
    group: ['category'],
    order: [['category', 'ASC']],
    raw: true,
  });

  // ---- Low Stock Products (full list) ----
  const lowStockProducts = await Product.findAll({
    where: {
      isActive: true,
      [Op.and]: [
        literal('"Product"."quantity_in_stock" <= "Product"."reorder_threshold"'),
      ],
    },
    attributes: ['id', 'sku', 'name', 'category', 'quantityInStock', 'reorderThreshold'],
    order: [['quantityInStock', 'ASC']],
    limit: 20,
    raw: true,
  });

  // ---- Cold Items Expiring Within 3 Days ----
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);

  const expiringSoonItems = await sequelize.query(
    `
    SELECT
      p.id, p.sku, p.name, p.quantity_in_stock AS "quantityInStock",
      cd.expiry_date AS "expiryDate", cd.storage_temp AS "storageTemp",
      (cd.expiry_date::date - CURRENT_DATE) AS "daysUntilExpiry"
    FROM products p
    JOIN cold_details cd ON cd.product_id = p.id
    WHERE p.is_active = true
      AND cd.expiry_date <= CURRENT_DATE + INTERVAL '3 days'
    ORDER BY cd.expiry_date ASC
    LIMIT 20
    `,
    { type: QueryTypes.SELECT }
  );

  return {
    products: {
      total: totalProducts,
      active: activeProducts,
      inactive: inactiveProducts,
    },
    categoryBreakdown: categoryBreakdown.map((c) => ({
      category: c.category,
      count: parseInt(c.count, 10),
    })),
    lowStock: {
      count: lowStockProducts.length,
      products: lowStockProducts,
    },
    expiryAlerts: {
      count: expiringSoonItems.length,
      products: expiringSoonItems,
    },
  };
};

// ============================================================================
// 3. Top-Selling Products
// ============================================================================

/**
 * Aggregate top-selling products ranked by quantity sold and gross revenue.
 * @param {number} limit - Number of top products to return (default: 10)
 * @param {string} period - 'today' | '7days' | '30days' | 'all' (default: 'all')
 */
const getTopSellingProducts = async (limit = 10, period = 'all') => {
  const parsedLimit = Math.min(parseInt(limit, 10) || 10, 50);

  let dateFilter = '';
  if (period === 'today') {
    dateFilter = `AND t.created_at >= CURRENT_DATE AND t.created_at < CURRENT_DATE + INTERVAL '1 day'`;
  } else if (period === '7days') {
    dateFilter = `AND t.created_at >= NOW() - INTERVAL '7 days'`;
  } else if (period === '30days') {
    dateFilter = `AND t.created_at >= NOW() - INTERVAL '30 days'`;
  }

  const topProducts = await sequelize.query(
    `
    SELECT
      ti.product_id AS "productId",
      ti.product_name_snapshot AS "productName",
      ti.sku_snapshot AS "sku",
      p.category,
      p.image_url AS "imageUrl",
      SUM(ti.quantity)::int AS "totalQuantitySold",
      SUM(ti.line_total)::float AS "totalRevenue",
      COUNT(DISTINCT ti.transaction_id)::int AS "transactionCount",
      AVG(ti.unit_price)::float AS "avgUnitPrice"
    FROM transaction_items ti
    JOIN transactions t ON t.id = ti.transaction_id
    LEFT JOIN products p ON p.id = ti.product_id
    WHERE 1=1 ${dateFilter}
    GROUP BY ti.product_id, ti.product_name_snapshot, ti.sku_snapshot, p.category, p.image_url
    ORDER BY "totalQuantitySold" DESC, "totalRevenue" DESC
    LIMIT :limit
    `,
    {
      type: QueryTypes.SELECT,
      replacements: { limit: parsedLimit },
    }
  );

  return {
    period,
    limit: parsedLimit,
    products: topProducts,
  };
};

// ============================================================================
// 4. Today's Detailed Sales Report
// ============================================================================

/**
 * Detailed breakdown of all transactions made today.
 */
const getTodaysSalesReport = async () => {
  const { start, end } = getTodayRange();

  const transactions = await Transaction.findAll({
    where: { createdAt: { [Op.between]: [start, end] } },
    include: [
      { model: User, as: 'cashier', attributes: ['id', 'name'] },
      { model: TransactionItem, as: 'items' },
    ],
    order: [['createdAt', 'DESC']],
  });

  // Revenue aggregates for today
  const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.grandTotal || 0), 0);
  const totalTax = transactions.reduce((sum, t) => sum + parseFloat(t.taxAmount || 0), 0);
  const totalSubtotal = transactions.reduce((sum, t) => sum + parseFloat(t.subtotal || 0), 0);

  // Payment method breakdown
  const paymentBreakdown = transactions.reduce((acc, t) => {
    acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + parseFloat(t.grandTotal || 0);
    return acc;
  }, {});

  // Per-cashier totals
  const cashierBreakdown = {};
  for (const t of transactions) {
    const cashierName = t.cashier?.name || 'Unknown';
    if (!cashierBreakdown[cashierName]) {
      cashierBreakdown[cashierName] = { transactionCount: 0, revenue: 0 };
    }
    cashierBreakdown[cashierName].transactionCount += 1;
    cashierBreakdown[cashierName].revenue += parseFloat(t.grandTotal || 0);
  }

  return {
    date: new Date().toISOString().slice(0, 10),
    summary: {
      transactionCount: transactions.length,
      totalSubtotal: Math.round(totalSubtotal * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    },
    paymentMethodBreakdown: paymentBreakdown,
    cashierBreakdown,
    transactions,
  };
};

// ============================================================================
// 5. Low-Stock Report
// ============================================================================

/**
 * Detailed low-stock report grouped by category and sorted by urgency.
 */
const getLowStockReport = async () => {
  const lowStockProducts = await Product.findAll({
    where: {
      isActive: true,
      [Op.and]: [
        literal('"Product"."quantity_in_stock" <= "Product"."reorder_threshold"'),
      ],
    },
    attributes: [
      'id',
      'sku',
      'name',
      'category',
      'price',
      'quantityInStock',
      'reorderThreshold',
      'imageUrl',
    ],
    order: [
      ['quantityInStock', 'ASC'],
      ['category', 'ASC'],
    ],
  });

  // Group by category
  const groupedByCategory = lowStockProducts.reduce((acc, product) => {
    const cat = product.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: parseFloat(product.price),
      quantityInStock: product.quantityInStock,
      reorderThreshold: product.reorderThreshold,
      stockDeficit: product.reorderThreshold - product.quantityInStock,
      severity: product.quantityInStock === 0 ? 'out_of_stock' : 'low',
    });
    return acc;
  }, {});

  const outOfStockCount = lowStockProducts.filter((p) => p.quantityInStock === 0).length;

  return {
    summary: {
      totalLowStockItems: lowStockProducts.length,
      outOfStockItems: outOfStockCount,
      categoriesAffected: Object.keys(groupedByCategory).length,
    },
    groupedByCategory,
  };
};

module.exports = {
  getAdminDashboardSummary,
  getInventoryDashboardStats,
  getTopSellingProducts,
  getTodaysSalesReport,
  getLowStockReport,
};
