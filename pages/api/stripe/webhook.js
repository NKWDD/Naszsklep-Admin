import { buffer } from 'micro';
import { mongooseConnect } from "@/lib/mongoose";
import mongoose from 'mongoose';
import { Order } from "@/models/Order";
const stripe = require('stripe')(process.env.STRIPE_SK);

export const config = {
  api: {
    bodyParser: false,
  },
};

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const reqBuffer = await buffer(req);
    
    let event;

    try {
      event = stripe.webhooks.constructEvent(reqBuffer, sig, endpointSecret);
      console.log('Webhook event verified:', event.type);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      console.log('Processing checkout session:', {
        sessionId: session.id,
        orderId: session.metadata?.orderId,
        paymentStatus: session.payment_status
      });

      try {
        await mongooseConnect();
        
        const orderId = session.metadata?.orderId;
        if (!orderId) {
          console.error('Missing orderId in metadata:', session.metadata);
          return res.status(400).json({ error: 'Order ID missing in session metadata' });
        }
        
        const order = await Order.findById(new mongoose.Types.ObjectId(orderId));

        // Update order with payment information
        order.paid = true;
        order.paymentStatus = 'paid';
        order.stripeSessionId = session.id;
        order.paymentIntent = session.payment_intent;
        order.totalAmount = session.amount_total / 100; // Convert from cents to whole currency units

        await order.save();
        console.log('Order updated successfully:', order._id);

        return res.status(200).json({
          received: true,
          orderId: order._id,
          status: 'success'
        });
      } catch (error) {
        console.error('Error processing order:', error);
        return res.status(500).json({ error: 'Error processing order' });
      }
    }

    // Handle other event types if needed
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing error' });
  }
};

export default handleStripeWebhook;