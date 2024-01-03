const Product = require("../models/product");
const {
  verifyTokenAndAuthorization,
  verifyAdminToken,
} = require("./verifyToken");
const router = require("express").Router();

// CREATE PRODUCT'
router.post("/create", verifyAdminToken, async (req, res) => {
  const newProduct = new Product(req.body);
  try {
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
});

// UPDATE PRODUCT
router.put("/update/:id", verifyAdminToken, async (req, res) => {
  try {
    const updateProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },

      { $new: true }
    );
    res.status(201).json(updateProduct);
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
});

// DELETE PRODUCT
router.put("/delete/:id", verifyAdminToken, async (req, res) => {
  try {
    const updateProduct = await Product.findByIdAndDelete(req.params.id);
    res.status(201).json("Item deleted");
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
});

// VIEW ALL PRODUCTS
router.get("/all", async (req, res) => {
  const newProductQuery = req.query.new;
  const productCategory = req.query.category;
  try {
    let products;

    if (newProductQuery) {
      products = await Product.find().sort({ createdAt: -1 }).limit(5);
    } else if (productCategory) {
      products = await Product.find({
        categories: {
          $in: [productCategory],
        },
      });
    } else {
      const findProduct = await Product.find();
    }
    res.status(200).json(findProduct);
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
});

// VIEW ONE PRODUCT
router.get("/:id", async (req, res) => {
  try {
    const findProduct = await Product.findById(req.params.id);
    res.status(200).json(findProduct);
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
});

module.exports = router;
