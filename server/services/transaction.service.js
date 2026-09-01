/**
 * @file services/transaction.service.js
 * @description Service layer for retrieving transaction history, invoices, and cashier personal sales records.
 */

const { Op } = require('sequelize');
const { Transaction, TransactionItem, User, Product } = require('../models');
const ApiError = require('../utils/apiError');
const { ROLES } = require('../constants/roles.constant');

/**
 * Standard includes for transaction queries.
 */
const transactionIncludes = [
  {
    model: User,
    as: 'cashier',
    attributes: ['id', 'name', 'email'],
  },
  {
    model: TransactionItem,
    as: 'items',
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'sku', 'name', 'category', 'imageUrl'],
      },
    ],
  },
];

/**
 * Retrieve personal transaction history for the logged-in Cashier ("My Sales").
 */
const getCashierSales = async (cashierId, { startDate, endDate, page = 1, limit = 10 }) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  const where = { cashierId };

  // Date range filtering
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) where.createdAt[Op.lte] = new Date(endDate);
  }

  const { count, rows } = await Transaction.findAndCountAll({
    where,
    include: transactionIncludes,
    limit: limitNum,
    offset,
    order: [['createdAt', 'DESC']],
    distinct: true,
  });

  return {
    transactions: rows,
    pagination: {
      total: count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(count / limitNum) || 1,
    },
  };
};

/**
 * Retrieve all store-wide transactions (for Admin and Inventory Manager auditing).
 */
const getAllStoreTransactions = async ({ cashierId, startDate, endDate, page = 1, limit = 10 }) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  const where = {};

  if (cashierId) {
    where.cashierId = cashierId;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt[Op.lte] = end;
    }
  }

  const { count, rows } = await Transaction.findAndCountAll({
    where,
    include: transactionIncludes,
    limit: limitNum,
    offset,
    order: [['createdAt', 'DESC']],
    distinct: true,
  });

  return {
    transactions: rows,
    pagination: {
      total: count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(count / limitNum) || 1,
    },
  };
};

/**
 * Retrieve specific invoice/receipt by ID.
 */
const getTransactionById = async (transactionId, requestingUser) => {
  const transaction = await Transaction.findByPk(transactionId, {
    include: transactionIncludes,
  });

  if (!transaction) {
    throw ApiError.notFound(`Transaction with ID '${transactionId}' not found.`);
  }

  // Cashiers can only view their own invoices
  if (requestingUser.role === ROLES.CASHIER && transaction.cashierId !== requestingUser.id) {
    throw ApiError.forbidden("You are not authorized to view other cashiers' transactions.");
  }

  return transaction;
};

module.exports = {
  getCashierSales,
  getAllStoreTransactions,
  getTransactionById,
};
