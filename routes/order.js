const router = require("express").Router();
const Order = require("../models/order");
const { verifyTokenAndAuthz, verifyAdminToken } = require("./verifyToken");

router.post("/", verifyTokenAndAuthz, async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    return res.status(201).json("Order successfully created");
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
