import { mongooseConnect } from '@/lib/mongoose';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';

export default async function handler(req, res) {
  const { orderId } = req.query;

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  await mongooseConnect();
  
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If line_items is an array
    if (Array.isArray(order.line_items) && order.line_items.length > 0) {
      // Extract product names
      const productNames = order.line_items
        .filter(item => item.price_data?.product_data?.name)
        .map(item => item.price_data.product_data.name);
      
      if (productNames.length > 0) {
        // Find products by name
        const products = await Product.find({ title: { $in: productNames } });
        
        // Create a map for easy lookup by name
        const productMap = {};
        products.forEach(product => {
          productMap[product.title] = {
            unit: product.unit
          };
        });
        
        // Add unit info to each line item
        const orderObj = order.toObject ? order.toObject() : order;
        orderObj.line_items = order.line_items.map(item => {
          const itemObj = typeof item.toObject === 'function' ? item.toObject() : {...item};
          const productName = item.price_data?.product_data?.name;
          
          if (productName && productMap[productName]) {
            itemObj.unit = productMap[productName].unit;
          }
          
          return itemObj;
        });
        
        return res.status(200).json(orderObj);
      }
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: 'Error fetching order details', error: error.message });
  }
}