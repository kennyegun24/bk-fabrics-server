const router = require("express").Router();
const OrderSchema = require("../models/order");
const UserSchema = require("../models/user");

router.get("/stats", async (req, res) => {
  console.log("stats");
  try {
    // Fetch pending orders count
    const pendingOrdersCountPromise = OrderSchema.countDocuments({
      status: "Pending",
    });

    // Fetch delivered orders count
    const deliveredOrdersCountPromise = OrderSchema.countDocuments({
      status: "delivered",
    });

    const onDeliveryOrdersCountPromise = OrderSchema.countDocuments({
      status: "on delivery",
    });

    // Fetch users count
    const usersCountPromise = UserSchema.countDocuments();
    const ordersCountPromise = OrderSchema.countDocuments();

    // Resolve all promises concurrently
    const [
      pendingOrdersCount,
      deliveredOrdersCount,
      onDeliveryOrderCount,
      usersCount,
      ordersCount,
    ] = await Promise.all([
      pendingOrdersCountPromise,
      deliveredOrdersCountPromise,
      onDeliveryOrdersCountPromise,
      usersCountPromise,
      ordersCountPromise,
    ]);

    return res.json({
      stats: [
        {
          sales: `${pendingOrdersCount} Pending`,
          header: "Pending Orders",
          prevText: `${pendingOrdersCount} pending orders / ${ordersCount} total orders`,
          percentageDifference: (pendingOrdersCount / ordersCount) * 100,
        },
        {
          sales: `${deliveredOrdersCount} Delivered`,
          header: "Delivered Orders",
          prevText: `${deliveredOrdersCount} delivered orders / ${ordersCount} total orders`,
          percentageDifference: (deliveredOrdersCount / ordersCount) * 100,
        },
        {
          sales: `${onDeliveryOrderCount} On-Delivery`,
          header: "On-delivery Orders",
          prevText: `${onDeliveryOrderCount} orders on-delivery / ${ordersCount} total orders`,
          percentageDifference: (onDeliveryOrderCount / ordersCount) * 100,
        },
        {
          sales: `${ordersCount} Total Deliveries`,
          header: "Total Deliveries",
          prevText: `You have a total ${ordersCount} deliveries (orders) so far`,
        },
      ],
      usersCount: usersCount,
      ordersCount: ordersCount,
    });
  } catch (error) {
    return res.json({ error: "Internal Server Error" });
  }
});

module.exports = router;
