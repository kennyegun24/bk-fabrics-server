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
const mongoose = require("mongoose");

dotenv.config();
app.use(bodyParser.json());
// app.use(express.json())
app.use(
  cors({
    origin: "http://localhost:3001",
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

app.listen(4000, () => {
  console.log("server is running");
});
