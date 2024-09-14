const { verifyAdminToken } = require("./verifyToken");
const router = require("express").Router();
const ShippingFee = require("../models/shippingFees");

router.post("/new-fees", verifyAdminToken, async (req, res) => {
  const { country, stateName, fee } = req.body;

  try {
    const existingCountry = await ShippingFee.findOne({ country });
    if (existingCountry) {
      const existingState = existingCountry.states.find(
        (state) => state.stateName === stateName
      );
      if (existingState) {
        existingState.fee = fee;
        await existingCountry.save();
        return res.status(200).json({
          success: true,
          message: `Shipping fee for ${stateName} in ${country} updated to ${fee}.`,
        });
      } else {
        existingCountry.states.push({ stateName, fee });
        await existingCountry.save();
        return res.status(200).json({
          success: true,
          message: `State ${stateName} added to ${country}.`,
        });
      }
    } else {
      const newCountry = new ShippingFee({
        country,
        states: [{ stateName, fee }],
      });
      await newCountry.save();
      return res.status(201).json({
        success: true,
        message: `Country ${country} and state ${stateName} added.`,
      });
    }
  } catch (error) {
    console.error("Error adding/updating shipping fees:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding/updating the shipping fees.",
    });
  }
});

router.get("/get-fee", async (req, res) => {
  const { country, state } = req.query;

  try {
    // Find the country in the shipping fee collection
    const countryData = await ShippingFee.findOne({ country });

    if (!countryData) {
      return res.status(404).json({
        success: false,
        message: `Shipping fees for ${country} not found.`,
      });
    }

    // Find the state within the country
    const stateData = countryData?.states?.find(
      (stateObj) => stateObj?.stateName?.toLowerCase() === state?.toLowerCase()
    );

    if (!stateData) {
      return res.status(404).json({
        success: false,
        message: `Shipping fee for state ${state} in ${country} not found.`,
      });
    }

    // Respond with the shipping fee
    return res.status(200).json({
      success: true,
      shippingFee: stateData.fee,
    });
  } catch (error) {
    console.error("Error fetching shipping fee:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the shipping fee.",
    });
  }
});

module.exports = router;

module.exports = router;
