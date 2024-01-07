const router = require("express").Router();
const Order = require("../models/order");
const Product = require("../models/product");
const { verifyTokenAndAuthz, verifyAdminToken } = require("./verifyToken");

router.post("/", verifyTokenAndAuthz, async (req, res) => {
  try {
    let prods = [];
    let amount = 0;
    const { products } = req.body;
    const line_items = await Promise.all(
      products.map(async (product) => {
        const prod = await Product.findById(product.id);
        const stock = prod.in_stock - product.quantity;
        const sold = prod.sold + product.quantity;
        prod.in_stock = stock;
        prod.sold = sold;
        prod.save();

        if (!prod) {
          return null;
        }
        amount += prod.price;
        prods.push(prod);
      })
    );
    const newOrder = new Order({
      userId: req.body.userId,
      address: req.body.address,
      products: prods,
      amount,
    });
    await newOrder.save();
    return res.status(201).json("Order successfully created");
    prods = [];
  } catch (error) {
    return res.status(500).json("Something went wrong");
  }
});

router.put("/update/:id", verifyAdminToken, async (req, res) => {
  try {
    const newOrder = Order.findByIdAndUpdate(
      req.body.order_id,
      {
        $set: req.body,
      },
      { new: true }
    );
    return res.status(201).json("Order successfully created");
  } catch (error) {
    return res.status(500).json("Something went wrong");
  }
});

router.get("/all", verifyAdminToken, (req, res) => {
  try {
    const allOrders = Order.find();
    return res.status(201).json(allOrders);
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
