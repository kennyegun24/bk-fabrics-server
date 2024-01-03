const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const paymentCheckout = require("./routes/payment");
const dotenv = require("dotenv");
dotenv.config();
app.use(bodyParser.json());
// app.use(express.json())
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

const client_sec = process.env.STRIPE_KEY;

const stripe = require("stripe")(client_sec);

app.use("/api/payment", paymentCheckout);

app.listen(4000, () => {
  console.log("server is running");
});
