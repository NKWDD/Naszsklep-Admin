import {model, models, Schema} from "mongoose";

const OrderSchema = new Schema({
  userEmail: String,
  line_items: Object,
  name: String,
  email: String,
  phone: String,
  city: String,
  postalCode: String,
  streetAddress: String,
  country: String,
  paid: {
    type: Boolean,
    default: false
  },
  // New fields for Stripe integration
  stripeSessionId: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentIntent: String,
  totalAmount: Number,
}, {
  timestamps: true,
});

// Add an index for faster lookups
OrderSchema.index({ stripeSessionId: 1 });

export const Order = models?.Order || model('Order', OrderSchema);