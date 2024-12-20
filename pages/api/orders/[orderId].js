// pages/api/orders/[orderId].js
import { mongooseConnect } from '@/lib/mongoose';
import { Order } from '@/models/Order';

export default async function handler(req, res) {
  const { orderId } = req.query;  // Extract `orderId` from query params

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required" });  // Handle missing orderId
  }

  await mongooseConnect();
  
  try {
    const order = await Order.findById(orderId);  // Find the order by ID

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);  // Return the order if found
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order details', error: error.message });
  }
}
