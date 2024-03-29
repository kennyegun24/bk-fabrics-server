const router = require("express").Router();
const Order = require("../models/order");
const Product = require("../models/product");
const {
  verifyTokenAndAuthz,
  verifyAdminToken,
  verifyToken,
} = require("./verifyToken");

router.post("/", verifyToken, async (req, res) => {
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
      postalCode: req.body.postalCode,
      phoneNumber: req.body.phoneNumber,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      country: req.body.country,
      city: req.body.city,
      state: req.body.state,
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
  console.log(req.body.order_id);
  try {
    const newOrder = await Order.findByIdAndUpdate(
      req.body.order_id,
      {
        $set: { ...req.body },
      },
      { new: true }
    );
    return res.status(201).json("Order successfully created");
  } catch (error) {
    return res.status(500).json("Something went wrong");
  }
});

router.get("/all", verifyAdminToken, async (req, res) => {
  try {
    const allOrders = await Order.find();
    return res.status(200).json(allOrders);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

// GET ONE ORDER
router.get("/:id", async (req, res) => {
  try {
    const findOrder = await Order.findById(req.params.id);
    res.status(200).json(findOrder);
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
});

module.exports = router;
