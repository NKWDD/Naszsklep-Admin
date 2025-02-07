import mongoose from 'mongoose';
import { Order } from "@/models/Order";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const event = req.body;

    // ✅ Check if it's a checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // ✅ Retrieve orderId from session metadata
      const orderId = session.metadata?.orderId;
      console.log('✅ Received orderId:', orderId);

      if (!orderId) {
        console.error('❌ Missing orderId in session metadata');
        return res.status(400).json({ error: 'Order ID missing in session metadata' });
      }

      // ✅ Convert orderId to MongoDB ObjectId
      const objectId = new mongoose.Types.ObjectId(orderId);

      // ✅ Update the order in MongoDB
      const updatedOrder = await Order.findByIdAndUpdate(
        objectId,
        { paid: true, updatedAt: new Date() },
        { new: true }
      );

      if (!updatedOrder) {
        console.error('❌ Order not found:', orderId);
        return res.status(404).json({ error: 'Order not found' });
      }

      console.log('✅ Order updated successfully:', updatedOrder);
      return res.status(200).json({ success: true });
    }

    res.status(400).json({ error: 'Unhandled event type' });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
