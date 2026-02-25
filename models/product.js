import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  altNames: [{ type: String }],
  description: {
    type: String,
    required: true,
  },
  images: [{ type: String }],
  labelPrice: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    required: true,
    default: true,
  },
  category:{
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("products", productSchema);

export default Product;
