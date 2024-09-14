const Product = require("../models/product");
const router = require("express").Router();
const dotenv = require("dotenv");
const { verifyTokenAndAuthz, verifyToken } = require("./verifyToken");
const { default: axios } = require("axios");
dotenv.config();
const client_sec = process.env.STRIPE_KEY;
const pub_key = process.env.STRIPE_PUB_KEY;
const stripe = require("stripe")(client_sec);

router.post("/create-checkout-session", verifyToken, async (req, res) => {
  try {
    const { products, country, state } = req.body;
    console.log(process.env.API_URL);
    const shippingFeeResponse = await axios.get(
      `${process.env.API_URL}shipping/get-fee`,
      {
        params: { country, state },
      }
    );
    const shippingFee = await shippingFeeResponse.data.shippingFee;
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

    line_items.unshift({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Shipping Fee",
        },
        unit_amount: Math.round(shippingFee * 100),
      },
      quantity: 1,
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.FAILURE_URL,
    });

    res.status(200).json({ id: session.id, pub_key: pub_key });
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
