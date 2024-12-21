import mongoose, { model, Schema, models } from "mongoose";

const ProductSchema = new Schema(
  {
    vendor: String,
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    images: [{ type: String }],
    category: { type: mongoose.Types.ObjectId, ref: 'Category' },
    properties: { type: Object },
    unit: {
        type: new mongoose.Schema(
          {
            type: { type: String, required: true }, 
            value: { type: Number, required: true }, 
          },
          { _id: false } 
        ),
      },
      
  },
  { timestamps: true } // Moved here
);

export const Product = models.Product || model('Product', ProductSchema);
