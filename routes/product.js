const Product = require("../models/product");
const {
  verifyTokenAndAuthorization,
  verifyAdminToken,
  verifyTokenAndAuthz,
} = require("./verifyToken");
const router = require("express").Router();

// CREATE PRODUCT'
router.post("/create", async (req, res) => {
  const newProduct = new Product(req.body);
  try {
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json(error);
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
router.delete("/delete/:id", verifyAdminToken, async (req, res) => {
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
  const topRated = req.query.top_rated;
  const mostSold = req.query.most_sold;
  const pageNumber = req.query.page || 0;
  const perPage = 10;
  try {
    let products;

    if (newProductQuery) {
      products = await Product.find().sort({ createdAt: -1 }).limit(5);
    } else if (topRated) {
      products = await Product.find().sort({ "rating.ratings": -1 }).limit(5);
    } else if (mostSold) {
      products = await Product.find().sort({ sold: -1 }).limit(5);
    } else {
      // GET ALL PRODUCTS WITH PAGINATION FUNCTIONALITY
      products = await Product.find()
        .skip(pageNumber * perPage)
        .limit(perPage);
    }
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json("Something went wrong");
  }
});

// // VIEW ONE PRODUCT
router.get("/:id", async (req, res) => {
  try {
    const findProduct = await Product.findById(req.params.id);
    res.status(200).json(findProduct);
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
});

router.post("/rate", verifyTokenAndAuthz, async (req, res) => {
  try {
    const { product_id, rating } = req.body;
    const product = await Product.findById(product_id);

    if (!product) {
      return res.status(404).json("Product not found");
    }

    const totalRatings =
      product.rating.ratings * product.rating.num_of_users_rated;
    const newTotalRatings = totalRatings + rating;
    const newNumOfUsersRated = product.rating.num_of_users_rated + 1;
    const newAverageRating = newTotalRatings / newNumOfUsersRated;

    // Update product's ratings
    product.rating.ratings = newAverageRating;
    product.rating.num_of_users_rated = newNumOfUsersRated;

    await product.save();

    return res.status(200).json({ message: "Product rated successfully" });
  } catch (error) {
    return res.status(500).json("Something went wrong");
  }
});

module.exports = router;
