const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    product_name: { type: String, required: true },
    product_desc: { type: String, required: true },
    product_image: { type: String, required: true },
    categories: { type: Array, required: true },
    price: { type: Number, required: true },
    in_stock: { type: Number, required: true, default: 1 },
    rating: {
      ratings: { type: Number, required: true, default: 0 },
      num_of_users_rated: { type: Number, required: true, default: 0 },
    },
    sold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("products", ProductSchema);
