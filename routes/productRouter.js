import express from "express";
import {
  deleteProduct,
  getProducts,
  saveProduct,
  updateProduct,
  getProductById,
  searchProducts,
  newArrivalProducts,
  getCategoryProducts,
  getBrandProducts,
} from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get("/", getProducts);
productRouter.post("/", saveProduct);
productRouter.delete("/:productId", deleteProduct);
productRouter.put("/:productId", updateProduct);
productRouter.get("/search/:query", searchProducts);
productRouter.get("/new-arrivals", newArrivalProducts);
productRouter.get("/category/:categoryName", getCategoryProducts);
productRouter.get("/brand/:brand", getBrandProducts);
productRouter.get("/:productId", getProductById);

export default productRouter;
