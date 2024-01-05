const Product = require("../models/product");
const router = require("express").Router();
const dotenv = require("dotenv");
dotenv.config();
const client_sec = process.env.STRIPE_KEY;
const stripe = require("stripe")(client_sec);

router.post("/create-checkout-session", async (req, res) => {
  const { products } = req.body;
  const line_items = await Promise.all(
    products.map(async (product) => {
      const prod = await Product.findOne({ _id: product.id });
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: prod.product_name,
            images: [prod.product_image],
          },
          unit_amount: Math.round(prod.price * 100),
        },
        quantity: product.quantity,
      };
    })
  );
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: line_items,
    mode: "payment",
    success_url: "http://localhost:3000/payment/success",
    cancel_url: "http://localhost:3000/payment/failure",
  });
  res.json({ id: session.id });
});

module.exports = router;
