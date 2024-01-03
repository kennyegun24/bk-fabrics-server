const router = require("express").Router();
const client_sec = process.env.STRIPE_KEY;
const stripe = require("stripe")(client_sec);

router.post("/create-checkout-session", async (req, res) => {
  const { products } = req.body;
  const line_items = products.map((product) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: product.product_name,
        images: [product.product_image],
      },
      unit_amount: Math.round(product.price * 100),
    },
    quantity: product.quantity,
  }));

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
