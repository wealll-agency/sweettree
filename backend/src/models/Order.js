import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 } // Price at the time of purchase
});

const shippingAddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  deliveryAddress: { type: shippingAddressSchema, required: true },
  couponCode: { type: String },
  couponDiscount: { type: Number, default: 0, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
  shippingFee: { type: Number, required: true, default: 0 },
  tax: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Placed'
  },
  trackingNumber: { type: String },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  razorpayOrderId: { type: String, index: true },
  razorpayPaymentId: { type: String }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
