import { createSlice } from '@reduxjs/toolkit';

const getInitialCart = () => {
  return [];
};

const calculateTotals = (items, discountType = 'percentage', discountPercentage = 0, flatDiscountAmount = 0, applicableProducts = [], isCombo = false, minPurchaseAmount = 0) => {
  let subtotal = 0;
  let discountableSubtotal = 0;

  const cartProductIds = items.filter(i => i.itemType !== 'Combo').map(item => item.product);
  const cartComboIds = items.filter(i => i.itemType === 'Combo').map(item => item.combo);
  
  const hasAllComboProducts = isCombo && applicableProducts.length > 0 
    ? applicableProducts.every(pid => cartProductIds.includes(pid) || cartComboIds.includes(pid))
    : false;

  items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    if (isCombo) {
      if (hasAllComboProducts && (applicableProducts.includes(item.product) || applicableProducts.includes(item.combo))) {
        discountableSubtotal += itemTotal;
      }
    } else {
      if (!applicableProducts || applicableProducts.length === 0 || applicableProducts.includes(item.product) || applicableProducts.includes(item.combo)) {
        discountableSubtotal += itemTotal;
      }
    }
  });

  let discount = 0;
  if (discountType === 'flat') {
    discount = Math.min(flatDiscountAmount, discountableSubtotal);
  } else {
    discount = Math.round((discountableSubtotal * discountPercentage) / 100);
  }

  // Critical fix: Nullify discount if subtotal drops below the required minimum
  if (minPurchaseAmount > 0 && subtotal < minPurchaseAmount) {
    discount = 0;
  }

  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * 0.05); // 5% GST
  const shippingFee = taxableAmount >= 1999 || items.length === 0 ? 0 : 'TBC';
  const total = taxableAmount + tax + (typeof shippingFee === 'number' ? shippingFee : 0);

  return { subtotal, discount, tax, shippingFee, total };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: getInitialCart(),
    couponCode: '',
    discountType: 'percentage',
    discountPercentage: 0,
    flatDiscountAmount: 0,
    applicableProducts: [],
    isCombo: false,
    minPurchaseAmount: 0,
    subtotal: 0,
    discount: 0,
    tax: 0,
    shippingFee: 0,
    total: 0
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, combo, itemType = 'Product', quantity, size } = action.payload;
      
      const isComboItem = itemType === 'Combo';
      const activePrice = isComboItem ? combo.comboPrice : product.price;
      const itemId = isComboItem ? combo._id : product._id;

      const existingIndex = state.items.findIndex(
        item => item.itemType === itemType && 
                (isComboItem ? item.combo === itemId : item.product === itemId) && 
                item.size === size
      );

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += quantity;
      } else {
        const newItem = {
          itemType,
          name: isComboItem ? combo.name : product.name,
          price: activePrice,
          image: isComboItem ? combo.image : (product.image || (product.images && product.images[0]) || ''),
          quantity,
          size,
          maxStock: isComboItem ? Infinity : product.stock // Backend handles combo stock validation
        };
        
        if (isComboItem) {
          newItem.combo = itemId;
        } else {
          newItem.product = itemId;
        }
        
        state.items.push(newItem);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('sweettree_cart', JSON.stringify(state.items));
      }

      const totals = calculateTotals(state.items, state.discountType, state.discountPercentage, state.flatDiscountAmount, state.applicableProducts, state.isCombo, state.minPurchaseAmount);
      Object.assign(state, totals);
    },
    removeFromCart: (state, action) => {
      const { product, combo, itemType = 'Product', size } = action.payload;
      const isComboItem = itemType === 'Combo';
      const itemId = isComboItem ? combo : product;
      
      state.items = state.items.filter(item => !(item.itemType === itemType && (isComboItem ? item.combo === itemId : item.product === itemId) && item.size === size));

      if (typeof window !== 'undefined') {
        localStorage.setItem('sweettree_cart', JSON.stringify(state.items));
      }

      const totals = calculateTotals(state.items, state.discountType, state.discountPercentage, state.flatDiscountAmount, state.applicableProducts, state.isCombo, state.minPurchaseAmount);
      Object.assign(state, totals);
    },
    updateCartQuantity: (state, action) => {
      const { product, combo, itemType = 'Product', size, quantity } = action.payload;
      const isComboItem = itemType === 'Combo';
      const itemId = isComboItem ? combo : product;
      
      const item = state.items.find(item => item.itemType === itemType && (isComboItem ? item.combo === itemId : item.product === itemId) && item.size === size);
      if (item) {
        item.quantity = isComboItem ? Math.max(1, quantity) : Math.max(1, Math.min(item.maxStock, quantity));
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('sweettree_cart', JSON.stringify(state.items));
      }

      const totals = calculateTotals(state.items, state.discountType, state.discountPercentage, state.flatDiscountAmount, state.applicableProducts, state.isCombo, state.minPurchaseAmount);
      Object.assign(state, totals);
    },
    applyCouponCode: (state, action) => {
      const { code, discountType, discountPercentage, flatDiscountAmount, applicableProducts, isCombo, minPurchaseAmount } = action.payload;
      state.couponCode = code;
      state.discountType = discountType || 'percentage';
      state.discountPercentage = discountPercentage || 0;
      state.flatDiscountAmount = flatDiscountAmount || 0;
      state.applicableProducts = applicableProducts || [];
      state.isCombo = isCombo || false;
      state.minPurchaseAmount = minPurchaseAmount || 0;

      const totals = calculateTotals(state.items, state.discountType, state.discountPercentage, state.flatDiscountAmount, state.applicableProducts, state.isCombo, state.minPurchaseAmount);
      Object.assign(state, totals);
    },
    clearCart: (state) => {
      state.items = [];
      state.couponCode = '';
      state.discountType = 'percentage';
      state.discountPercentage = 0;
      state.flatDiscountAmount = 0;
      state.applicableProducts = [];
      state.isCombo = false;
      state.minPurchaseAmount = 0;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sweettree_cart');
      }
      const totals = calculateTotals([], 'percentage', 0, 0, [], false, 0);
      Object.assign(state, totals);
    },
    recalculateCart: (state) => {
      const totals = calculateTotals(state.items, state.discountType, state.discountPercentage, state.flatDiscountAmount, state.applicableProducts, state.isCombo, state.minPurchaseAmount);
      Object.assign(state, totals);
    },
    hydrateCart: (state, action) => {
      state.items = action.payload;
      const totals = calculateTotals(state.items, state.discountType, state.discountPercentage, state.flatDiscountAmount, state.applicableProducts, state.isCombo, state.minPurchaseAmount);
      Object.assign(state, totals);
    }
  }
});

export const { addToCart, removeFromCart, updateCartQuantity, applyCouponCode, clearCart, recalculateCart, hydrateCart } = cartSlice.actions;
export default cartSlice.reducer;
