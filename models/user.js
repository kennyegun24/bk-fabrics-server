const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    user_name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    address: { type: Number },
    is_admin: { type: Boolean, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("products", userSchema);
