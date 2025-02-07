import { buffer } from 'micro';
import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
const stripe = require('stripe')(process.env.STRIPE_SK);

export const config = {
  api: {
    bodyParser: false,
  },
};

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const reqBuffer = await buffer(req);
  
  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(reqBuffer, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId; // This is the order ID we passed to Stripe

    // Connect to the database
    await mongooseConnect();

    // Find and update the order's paid status
    const order = await Order.findById(orderId);
    if (order) {
      order.paid = true;
      await order.save();
      console.log(`Order ${orderId} has been paid.`);
    }
  }

  res.status(200).send('Webhook received');
};

export default handleStripeWebhook;
