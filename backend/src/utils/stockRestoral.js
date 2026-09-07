import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';

/**
 * Restores stock for all items in an order.
 * Handles both Single products and Combo products (components).
 * @param {Object} order - The populated or unpopulated order object (must have `items` array with `itemType`, `quantity`, `product`, `comboComponentsSnapshot`)
 * @param {String} reason - Reason for stock adjustment (e.g. 'Payment Failed', 'Cancelled')
 * @param {Object} session - Mongoose transaction session (optional)
 */
async function restoreOrderStock(order, reason, session = null) {
  const options = session ? { session, runValidators: true } : { runValidators: true };

  for (const item of order.items) {
    if (item.itemType === 'Combo') {
      if (item.comboComponentsSnapshot && item.comboComponentsSnapshot.length > 0) {
        for (const comp of item.comboComponentsSnapshot) {
          const restoreQty = comp.quantity * item.quantity;
          
          await Product.findByIdAndUpdate(
            comp.product,
            { $inc: { stock: restoreQty, totalSold: -restoreQty } },
            options
          );

          const invUpdateOptions = session ? { new: true, runValidators: true, session } : { new: true, runValidators: true };
          
          await Inventory.findOneAndUpdate(
            { product: comp.product },
            { 
              $inc: { stockQuantity: restoreQty },
              $push: {
                adjustments: {
                  quantityChanged: restoreQty,
                  type: 'Restock',
                  reason: `${reason} (Order ID: ${order.orderId || order._id}, Combo: ${item.name})`,
                  adjustedBy: null // System action
                }
              }
            },
            invUpdateOptions
          );
        }
      }
    } else {
      // Single product
      if (item.product) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity, totalSold: -item.quantity } },
          options
        );

        const invUpdateOptions = session ? { new: true, runValidators: true, session } : { new: true, runValidators: true };

        await Inventory.findOneAndUpdate(
          { product: item.product },
          { 
            $inc: { stockQuantity: item.quantity },
            $push: {
              adjustments: {
                quantityChanged: item.quantity,
                type: 'Restock',
                reason: `${reason} (Order ID: ${order.orderId || order._id})`,
                adjustedBy: null // System action
              }
            }
          },
          invUpdateOptions
        );
      }
    }
  }
}

export { restoreOrderStock };
