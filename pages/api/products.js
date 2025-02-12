import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === "GET") {
    try {
      const { id, phrase, page = 1, all } = req.query;
      
      if (id) {
        const product = await Product.findById(id);
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
        return res.json(product);
      } 
  
      const productsQuery = {};
      if (phrase) {
        productsQuery["$or"] = [
          { title: { $regex: phrase, $options: "i" } },
          { description: { $regex: phrase, $options: "i" } },
        ];
      }
  
      let products, totalPages = 1;
  
      if (all) {
        // Fetch all products (used for settings page)
        products = await Product.find(productsQuery).sort({ createdAt: -1 });
      } else {
        // Apply search first, then paginate
        const allFilteredProducts = await Product.find(productsQuery).sort({ createdAt: -1 });
  
        // Paginate results
        const limit = 25;
        const skip = (page - 1) * limit;
        products = allFilteredProducts.slice(skip, skip + limit);
  
        // Calculate total pages only when paginating
        totalPages = Math.ceil(allFilteredProducts.length / limit);
      }
  
      return res.json({
        products,
        currentPage: all ? 1 : parseInt(page),
        totalPages,
      });
  
    } catch (error) {
      console.error("Error in Products API:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  
  

  if (method === "POST") {
    const { vendor, title, description, price, discountPrice, images, category, properties, unit } = req.body;

    const productData = {
      vendor,
      title,
      description,
      price,
      discountPrice,
      images,
      properties: properties || {},
      unit,
    };
    
    if (category && category.trim() !== "") {
      productData.category = category;
    }
    console.log(req.body); // Log to check if unit is present

    const productDoc = await Product.create(productData);
    return res.json(productDoc);
  }

  if (method === "PUT") {
    const { vendor, title, description, price, discountPrice, images, category, properties, unit, _id } = req.body;

    const updateData = {
      vendor,
      title,
      description,
      price,
      discountPrice,
      images,
      properties: properties || {},
      unit,
    };
    
    if (category && category.trim() !== "") {
      updateData.category = category;
    }
    
    await Product.updateOne({ _id }, updateData);
    return res.json(true);
    
  }

  if (method === "DELETE") {
    if (req.query?.id) {
      await Product.deleteOne({ _id: req.query?.id });
      return res.json(true);
    }
  }
}
