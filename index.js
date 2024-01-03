const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

const client_sec =
  "sk_test_51N1y0eFGKykGLNp4cycVEz1dGfnembei9I9xymJbk9YixTnLy5Igr6zqEEO5CveQvpMlRs7CV7ofV4NDLfFdjnnc00AlX8wEyB";

const stripe = require("stripe")(client_sec);

app.get("/payment-config", (req, res) => {
  res.send();
});
app.post("/create-checkout-session", async (req, res) => {
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
  console.log(session.id);

  res.json({ id: session.id });
});

app.listen(4000, () => {
  console.log("running");
});
