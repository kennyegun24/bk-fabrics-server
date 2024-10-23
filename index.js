const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const paymentCheckout = require("./routes/payment");
const dotenv = require("dotenv");
const product = require("./routes/product");
const categories = require("./routes/categories");
const authentication = require("./routes/auth");
const orders = require("./routes/order");
const stats = require("./routes/stats");
const shippingFees = require("./routes/shippingFees");
const dashboard = require("./routes/dashboard");
const delivery_stats = require("./routes/delivery_stats");
const order_graphs = require("./routes/order_graphs");
const mongoose = require("mongoose");

dotenv.config();
app.use(bodyParser.json());
// app.use(express.json())
app.use(
  cors({
    origin: "*",
  })
);

const mongoDB_key = process.env.MONGO_KEY;

mongoose
  .connect(process.env.MONGO_KEY)
  .then(() => console.log("DB CONNECTED"))
  .catch((err) => console.log(err));

app.use("/api/auth", authentication);
app.use("/api/payment", paymentCheckout);
app.use("/api/product", product);
app.use("/api/categories", categories);
app.use("/api/orders", orders);
app.use("/api/stats", stats);
app.use("/api/shipping", shippingFees);
app.use("/api/dashboard", dashboard);
app.use("/api/delivery", delivery_stats);
app.use("/api/order_graphs", order_graphs);
app.listen(4000, () => {
  console.log("server is running");
});
