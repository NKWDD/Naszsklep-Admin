import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export default async function handler(req, res) {
  await mongooseConnect();
  
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const orders = await Order.find()
      .skip(Number(skip))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalOrders = await Order.countDocuments();

    res.json({
      orders,
      hasMore: skip + orders.length < totalOrders,  // If there are more orders
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
}
