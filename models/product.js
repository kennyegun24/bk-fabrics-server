const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    product_name: { type: String, required: true },
    product_desc: { type: String, required: true },
    product_image: { type: String, required: true },
    price: { type: Number, required: true },
    in_stock: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("products", productSchema);
