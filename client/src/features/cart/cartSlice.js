/**
 * @file src/features/cart/cartSlice.js
 * @description Redux Toolkit slice for POS Shopping Cart, Barcode Scanning, Live Tax/Total calculations, and Checkout processing.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { posLookup, posCalculateCart, posCheckout } from '@/services/transactionService';
import toast from 'react-hot-toast';

const DEFAULT_TAX_RATE = 5.0; // 5% default store tax

/**
 * Helper to compute client-side line totals and cart totals
 */
const recalculateCartTotals = (items, taxRate = DEFAULT_TAX_RATE) => {
  const subtotal = items.reduce((sum, item) => {
    const unitPrice = parseFloat(item.price) || 0;
    const qty = parseInt(item.quantity, 10) || 0;
    return sum + Math.round(unitPrice * qty * 100) / 100;
  }, 0);

  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const numericTaxRate = parseFloat(taxRate) >= 0 ? parseFloat(taxRate) : DEFAULT_TAX_RATE;
  const taxAmount = Math.round(roundedSubtotal * (numericTaxRate / 100) * 100) / 100;
  const grandTotal = Math.round((roundedSubtotal + taxAmount) * 100) / 100;

  return {
    subtotal: roundedSubtotal,
    taxRate: numericTaxRate,
    taxAmount,
    grandTotal,
  };
};

/**
 * Async Thunk: Rapid SKU Scanner Lookup & Add to Cart
 */
export const scanSkuThunk = createAsyncThunk(
  'cart/scanSku',
  async (sku, { getState, dispatch, rejectWithValue }) => {
    try {
      const response = await posLookup(sku.trim());
      const product = response.data.product;

      if (!product) {
        return rejectWithValue('Product not found');
      }

      dispatch(cartSlice.actions.addToCart({ product, quantity: 1 }));
      toast.success(`Scanned: ${product.name}`, { id: 'scan-success', duration: 1500 });
      return product;
    } catch (error) {
      const message = error.response?.data?.message || `SKU '${sku}' not found in catalog`;
      toast.error(message, { id: 'scan-error', duration: 2500 });
      return rejectWithValue(message);
    }
  }
);

/**
 * Async Thunk: Validate stock & recalculate cart with backend
 */
export const validateCartThunk = createAsyncThunk(
  'cart/validateCart',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { cart } = getState();
      if (!cart.items || cart.items.length === 0) {
        return null;
      }

      const payload = {
        items: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        taxRate: cart.taxRate,
      };

      const response = await posCalculateCart(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to recalculate cart totals');
    }
  }
);

/**
 * Async Thunk: Process atomic checkout transaction
 */
export const processCheckoutThunk = createAsyncThunk(
  'cart/processCheckout',
  async (
    { paymentMethod = 'cash', customerInfo = null },
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      const { cart } = getState();
      if (!cart.items || cart.items.length === 0) {
        return rejectWithValue('Cart is empty. Please add items to checkout.');
      }

      const checkoutPayload = {
        items: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        paymentMethod,
        taxRate: cart.taxRate,
      };

      const response = await posCheckout(checkoutPayload);
      const receiptData = response.data.receipt;

      dispatch(cartSlice.actions.clearCart());
      toast.success(`Checkout Complete! Invoice #${receiptData.invoiceNumber}`, { duration: 3000 });
      return receiptData;
    } catch (error) {
      const msg = error.response?.data?.message || 'Checkout failed. Please check stock levels.';
      toast.error(msg, { duration: 4000 });
      return rejectWithValue(msg);
    }
  }
);

const initialState = {
  items: [],
  taxRate: DEFAULT_TAX_RATE,
  subtotal: 0,
  taxAmount: 0,
  grandTotal: 0,
  heldCarts: [], // Parked customer queues: [{ id, name, date, items, subtotal, grandTotal }]
  lastCompletedTransaction: null,
  isScanning: false,
  scanError: null,
  isProcessingCheckout: false,
  checkoutError: null,
  isCalculating: false,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingIndex = state.items.findIndex((item) => item.productId === product.id);

      if (existingIndex !== -1) {
        const item = state.items[existingIndex];
        const newQty = item.quantity + quantity;

        if (product.quantityInStock !== undefined && newQty > product.quantityInStock) {
          toast.error(`Cannot add more. Stock limit: ${product.quantityInStock}`);
          item.quantity = product.quantityInStock;
        } else {
          item.quantity = newQty;
        }
        item.lineTotal = Math.round(parseFloat(item.price) * item.quantity * 100) / 100;
      } else {
        const initialQty = Math.max(1, Math.min(quantity, product.quantityInStock || 9999));
        state.items.push({
          productId: product.id,
          sku: product.sku,
          name: product.name,
          category: product.category,
          price: parseFloat(product.price),
          quantity: initialQty,
          availableStock: product.quantityInStock,
          imageUrl: product.imageUrl || null,
          fragileDetail: product.fragileDetail || null,
          coldDetail: product.coldDetail || null,
          techDetail: product.techDetail || null,
          cleaningDetail: product.cleaningDetail || null,
          lineTotal: Math.round(parseFloat(product.price) * initialQty * 100) / 100,
        });
      }

      const totals = recalculateCartTotals(state.items, state.taxRate);
      state.subtotal = totals.subtotal;
      state.taxAmount = totals.taxAmount;
      state.grandTotal = totals.grandTotal;
    },

    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.productId !== productId);

      const totals = recalculateCartTotals(state.items, state.taxRate);
      state.subtotal = totals.subtotal;
      state.taxAmount = totals.taxAmount;
      state.grandTotal = totals.grandTotal;
    },

    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.productId === productId);

      if (item) {
        const parsedQty = parseInt(quantity, 10);
        if (parsedQty <= 0) {
          state.items = state.items.filter((i) => i.productId !== productId);
        } else {
          if (item.availableStock !== undefined && parsedQty > item.availableStock) {
            toast.error(`Max stock available: ${item.availableStock}`);
            item.quantity = item.availableStock;
          } else {
            item.quantity = parsedQty;
          }
          item.lineTotal = Math.round(parseFloat(item.price) * item.quantity * 100) / 100;
        }

        const totals = recalculateCartTotals(state.items, state.taxRate);
        state.subtotal = totals.subtotal;
        state.taxAmount = totals.taxAmount;
        state.grandTotal = totals.grandTotal;
      }
    },

    setTaxRate: (state, action) => {
      const rate = parseFloat(action.payload) >= 0 ? parseFloat(action.payload) : 0;
      state.taxRate = rate;

      const totals = recalculateCartTotals(state.items, state.taxRate);
      state.subtotal = totals.subtotal;
      state.taxAmount = totals.taxAmount;
      state.grandTotal = totals.grandTotal;
    },

    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.taxAmount = 0;
      state.grandTotal = 0;
      state.checkoutError = null;
    },

    holdCurrentCart: (state, action) => {
      if (state.items.length === 0) return;

      const label = action.payload || `Order #${state.heldCarts.length + 1}`;
      state.heldCarts.push({
        id: Date.now().toString(),
        label,
        savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: [...state.items],
        taxRate: state.taxRate,
        subtotal: state.subtotal,
        taxAmount: state.taxAmount,
        grandTotal: state.grandTotal,
      });

      state.items = [];
      state.subtotal = 0;
      state.taxAmount = 0;
      state.grandTotal = 0;
      toast.success(`Cart parked as "${label}"`);
    },

    resumeHeldCart: (state, action) => {
      const heldCartId = action.payload;
      const held = state.heldCarts.find((c) => c.id === heldCartId);

      if (held) {
        state.items = held.items;
        state.taxRate = held.taxRate;
        state.subtotal = held.subtotal;
        state.taxAmount = held.taxAmount;
        state.grandTotal = held.grandTotal;
        state.heldCarts = state.heldCarts.filter((c) => c.id !== heldCartId);
        toast.success(`Resumed "${held.label}"`);
      }
    },

    deleteHeldCart: (state, action) => {
      const heldCartId = action.payload;
      state.heldCarts = state.heldCarts.filter((c) => c.id !== heldCartId);
      toast.success('Parked cart removed');
    },

    setLastCompletedTransaction: (state, action) => {
      state.lastCompletedTransaction = action.payload;
    },

    clearLastCompletedTransaction: (state) => {
      state.lastCompletedTransaction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Scan SKU Thunk
      .addCase(scanSkuThunk.pending, (state) => {
        state.isScanning = true;
        state.scanError = null;
      })
      .addCase(scanSkuThunk.fulfilled, (state) => {
        state.isScanning = false;
      })
      .addCase(scanSkuThunk.rejected, (state, action) => {
        state.isScanning = false;
        state.scanError = action.payload;
      })

      // Validate Cart Thunk
      .addCase(validateCartThunk.pending, (state) => {
        state.isCalculating = true;
      })
      .addCase(validateCartThunk.fulfilled, (state, action) => {
        state.isCalculating = false;
        if (action.payload) {
          state.subtotal = action.payload.subtotal;
          state.taxAmount = action.payload.taxAmount;
          state.grandTotal = action.payload.grandTotal;
        }
      })
      .addCase(validateCartThunk.rejected, (state) => {
        state.isCalculating = false;
      })

      // Process Checkout Thunk
      .addCase(processCheckoutThunk.pending, (state) => {
        state.isProcessingCheckout = true;
        state.checkoutError = null;
      })
      .addCase(processCheckoutThunk.fulfilled, (state, action) => {
        state.isProcessingCheckout = false;
        state.lastCompletedTransaction = action.payload;
      })
      .addCase(processCheckoutThunk.rejected, (state, action) => {
        state.isProcessingCheckout = false;
        state.checkoutError = action.payload;
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  setTaxRate,
  clearCart,
  holdCurrentCart,
  resumeHeldCart,
  deleteHeldCart,
  setLastCompletedTransaction,
  clearLastCompletedTransaction,
} = cartSlice.actions;

export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotals = (state) => ({
  subtotal: state.cart.subtotal,
  taxRate: state.cart.taxRate,
  taxAmount: state.cart.taxAmount,
  grandTotal: state.cart.grandTotal,
  itemCount: state.cart.items.reduce((sum, i) => sum + i.quantity, 0),
});
export const selectHeldCarts = (state) => state.cart.heldCarts;
export const selectLastCompletedTransaction = (state) => state.cart.lastCompletedTransaction;

export default cartSlice.reducer;
