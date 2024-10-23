// import connectMongoDb from "../libs/mongodb";
const router = require("express").Router();
const OrderSchema = require("../models/order");
// import { NextResponse } require("next/server");

// export const dynamic = "force-dynamic";
router.get("/stats", async (req, res) => {
  // await connectMongoDb();

  try {
    const now = new Date();

    // Dates for the current periods
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Dates for the previous periods
    const startOfPreviousDay = new Date(startOfDay);
    startOfPreviousDay.setDate(startOfPreviousDay.getDate() - 1);

    const startOfPreviousMonth = new Date(startOfMonth);
    startOfPreviousMonth.setMonth(startOfPreviousMonth.getMonth() - 1);

    const startOfPreviousYear = new Date(startOfYear);
    startOfPreviousYear.setFullYear(startOfPreviousYear.getFullYear() - 1);

    const dailySalesPromise = OrderSchema.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      {
        $group: { _id: null, totalSales: { $sum: { $toDouble: "$amount" } } },
      },
    ]);

    const previousDailySalesPromise = OrderSchema.aggregate([
      {
        $match: { createdAt: { $gte: startOfPreviousDay, $lt: startOfDay } },
      },
      {
        $group: { _id: null, totalSales: { $sum: { $toDouble: "$amount" } } },
      },
    ]);

    const monthlySalesPromise = OrderSchema.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      {
        $group: { _id: null, totalSales: { $sum: { $toDouble: "$amount" } } },
      },
    ]);

    const previousMonthlySalesPromise = OrderSchema.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfPreviousMonth, $lt: startOfMonth },
        },
      },
      {
        $group: { _id: null, totalSales: { $sum: { $toDouble: "$amount" } } },
      },
    ]);

    const yearlySalesPromise = OrderSchema.aggregate([
      { $match: { createdAt: { $gte: startOfYear } } },
      {
        $group: { _id: null, totalSales: { $sum: { $toDouble: "$amount" } } },
      },
    ]);

    const previousYearlySalesPromise = OrderSchema.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfPreviousYear, $lt: startOfYear },
        },
      },
      {
        $group: { _id: null, totalSales: { $sum: { $toDouble: "$amount" } } },
      },
    ]);

    const totalSalesPromise = OrderSchema.aggregate([
      {
        $group: { _id: null, totalSales: { $sum: { $toDouble: "$amount" } } },
      },
    ]);

    const [
      dailySales,
      previousDailySales,
      monthlySales,
      previousMonthlySales,
      yearlySales,
      previousYearlySales,
      totalSales,
    ] = await Promise.all([
      dailySalesPromise,
      previousDailySalesPromise,
      monthlySalesPromise,
      previousMonthlySalesPromise,
      yearlySalesPromise,
      previousYearlySalesPromise,
      totalSalesPromise,
    ]);

    const formatDouble = (value) => {
      return parseFloat(value).toFixed(2);
    };

    const dailyStats = dailySales[0]?.totalSales || 0;
    const prevDailyStats = previousDailySales[0]?.totalSales || 0;
    const monthlyStats = monthlySales[0]?.totalSales || 0;
    const prevMonthlyStats = previousMonthlySales[0]?.totalSales || 0;
    const yearlyStats = yearlySales[0]?.totalSales || 0;
    const prevYearlyStats = previousYearlySales[0]?.totalSales || 0;
    console.log(
      prevDailyStats != 0
        ? Math.floor(dailyStats - prevDailyStats) / prevDailyStats || 1 * 100
        : 100
    );

    const dayPerc =
      prevDailyStats != 0
        ? (Math.floor(dailyStats - prevDailyStats) / prevDailyStats) * 100
        : 100;
    const actualDayPerc =
      prevDailyStats != 0
        ? (Math.floor(dailyStats - prevDailyStats) / prevDailyStats) * 100
        : (Math.floor(dailyStats - 0) / 1) * 100;
    const monthPerc =
      prevMonthlyStats != 0
        ? (Math.floor(monthlyStats - prevMonthlyStats) / prevMonthlyStats) * 100
        : 100;
    const actualMonthPerc =
      prevMonthlyStats != 0
        ? (Math.floor(monthlyStats - prevMonthlyStats) / prevMonthlyStats) * 100
        : (Math.floor(monthlyStats - 0) / 1) * 100;
    const yearPerc =
      prevYearlyStats != 0
        ? (Math.floor(yearlyStats - prevYearlyStats) / prevYearlyStats) * 100
        : 100;
    const actualYearPerc =
      prevYearlyStats != 0
        ? (Math.floor(yearlyStats - prevYearlyStats) / prevYearlyStats) * 100
        : (Math.floor(yearlyStats - 0) / 1) * 100;

    return res.json({
      totalSales: formatDouble(totalSales[0]?.totalSales || 0),
      dashboardSalesCards: [
        {
          sales: `$ ${formatDouble(dailyStats)}`,
          prevText: `  You made ${formatDouble(
            dailyStats - prevDailyStats
          )} from the previous day. ${actualDayPerc.toFixed(2)}%`,
          header: "Daily Sales",
          percentageDifference: dayPerc,
        },
        {
          sales: `$ ${monthlyStats}`,
          prevText: `  You made ${formatDouble(
            monthlyStats - prevMonthlyStats
          )} from the previous month. ${actualMonthPerc.toFixed(2)}%`,
          header: "Monthly Sales",
          percentageDifference: monthPerc,
        },
        {
          sales: `$ ${yearlyStats}`,
          prevText: `  You made ${formatDouble(
            yearlyStats - prevYearlyStats
          )} from the previous year. ${actualYearPerc.toFixed(2)}%`,
          header: "Yearly Sales",
          percentageDifference: yearPerc,
        },
      ],
    });
  } catch (error) {
    console.log(error);
    return res.json({ error: error });
  }
});

module.exports = router;
