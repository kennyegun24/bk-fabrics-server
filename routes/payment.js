const Product = require("../models/product");
const router = require("express").Router();
const dotenv = require("dotenv");
const { verifyTokenAndAuthz, verifyToken } = require("./verifyToken");
dotenv.config();
const client_sec = process.env.STRIPE_KEY;
const pub_key = process.env.STRIPE_PUB_KEY;
const stripe = require("stripe")(client_sec);

router.post("/create-checkout-session", verifyToken, async (req, res) => {
  try {
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

    res.status(200).json({ id: session.id, pub_key: pub_key });
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
