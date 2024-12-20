import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === "GET") {
    try {
      const { id, phrase, page = 1 } = req.query;
      const limit = 25;
      const skip = (page - 1) * limit;

      if (id) {
        const product = await Product.findById(id);
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
        return res.json(product);
      } else {
        const productsQuery = {};
        if (phrase) {
          productsQuery["$or"] = [
            { title: { $regex: phrase, $options: "i" } },
            { description: { $regex: phrase, $options: "i" } },
          ];
        }

        // Fetch products based on the query
        const products = await Product.find(productsQuery)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 });

        // Count the total number of products to calculate totalPages
        const totalProducts = await Product.countDocuments(productsQuery);
        const totalPages = Math.ceil(totalProducts / limit);

        // Send products and pagination data
        return res.json({
          products,
          currentPage: parseInt(page),
          totalPages,
        });
      }
    } catch (error) {
      console.error("Error in Products API:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (method === "POST") {
    const { vendor, title, description, price, discountPrice, images, category, properties } = req.body;

    const productData = {
      vendor,
      title,
      description,
      price,
      discountPrice,
      images,
      properties: properties || {},
    };
    if (category && category.trim() !== "") {
      productData.category = category;
    }

    const productDoc = await Product.create(productData);
    return res.json(productDoc);
  }

  if (method === "PUT") {
    const { vendor, title, description, price, discountPrice, images, category, properties, _id } = req.body;

    const updateData = {
      vendor,
      title,
      description,
      price,
      discountPrice,
      images,
      properties: properties || {},
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
