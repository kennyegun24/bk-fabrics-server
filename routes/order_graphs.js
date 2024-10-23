const router = require("express").Router();
const OrderSchema = require("../models/order");
const {
  subDays,
  startOfDay,
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
  startOfYear,
} = require("date-fns");

const generateWeekDays = () => {
  const now = new Date();
  const startOfWeek = startOfDay(subDays(now, 6));
  return eachDayOfInterval({ start: startOfWeek, end: now }).map((date) => ({
    date: format(date, "yyyy-MM-dd"),
    dayName: format(date, "EEEE"),
  }));
};

const generateMonthDays = () => {
  const now = new Date();
  const startOfPastMonth = startOfDay(subDays(now, 29));
  return eachDayOfInterval({ start: startOfPastMonth, end: now }).map(
    (date) => ({
      date: format(date, "yyyy-MM-dd"),
      dayName: format(date, "EEEE"),
    })
  );
};

const generateYearMonths = () => {
  const now = new Date();
  const startOfPastYear = startOfYear(now);
  return eachMonthOfInterval({ start: startOfPastYear, end: now }).map(
    (date) => ({
      date: format(date, "yyyy-MM"),
      monthName: format(date, "MMM"),
    })
  );
};

const aggregateOrders = async (startDate, groupBy) => {
  return await OrderSchema.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          [groupBy]: {
            $dateToString: {
              format: groupBy === "day" ? "%Y-%m-%d" : "%Y-%m",
              date: "$createdAt",
            },
          },
        },
        totalSales: { $sum: { $toDouble: "$amount" } },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
};

const fillMissingData = (data, referenceData, groupBy) => {
  const dataMap = data.reduce((map, item) => {
    map[item._id[groupBy]] = item;
    return map;
  }, {});

  return referenceData.map((ref) => {
    const id = ref.date;
    return {
      date: id,
      name: groupBy === "day" ? ref.dayName : ref.monthName,
      totalSales: dataMap[id] ? dataMap[id].totalSales : 0,
      count: dataMap[id] ? dataMap[id].count : 0,
    };
  });
};

router.get("/", async (req, res) => {
  try {
    const weekDays = generateWeekDays();
    const monthDays = generateMonthDays();
    const yearMonths = generateYearMonths();

    const startOfWeek = startOfDay(subDays(new Date(), 6));
    const startOfPastMonth = startOfDay(subDays(new Date(), 29));
    const startOfPastYear = startOfYear(new Date());

    const currentWeekData = await aggregateOrders(startOfWeek, "day");
    const pastMonthData = await aggregateOrders(startOfPastMonth, "day");
    const pastYearData = await aggregateOrders(startOfPastYear, "month");

    const filledWeekData = fillMissingData(currentWeekData, weekDays, "day");
    const filledMonthData = fillMissingData(pastMonthData, monthDays, "day");
    const filledYearData = fillMissingData(pastYearData, yearMonths, "month");

    return res.json({
      currentWeekData: filledWeekData,
      pastMonthData: filledMonthData,
      pastYearData: filledYearData,
    });
  } catch (error) {
    console.log(error);
    return res.json({ error });
  }
});

module.exports = router;
