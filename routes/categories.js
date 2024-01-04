const router = require("express").Router();
const Product = require("../models/product");

router.get("/all", async (req, res) => {
  const productCategory = req.query.category;
  const pageNumber = req.query.page || 0;
  const perPage = 10;
  try {
    let categoryProduct;
    if (productCategory) {
      // GET PRODUCTS BASED ON CATEGORY
      categoryProduct = await Product.find({
        categories: {
          $in: [productCategory],
        },
      })
        .skip(pageNumber * perPage)
        .limit(perPage);
    } else {
      const categories = await Product.distinct("categories");
      res.json(categories);
    }
    return res.status(200).json(categoryProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
