const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const shippingService = require('../services/shipping.service');

// POST /shipping/quote — body: { city, province, items: [{ productId, quantity }] }
const quote = catchAsync(async (req, res) => {
  const { city, province, items } = req.body;
  const data = await shippingService.getQuote({ city, province, items: items || [] });
  ApiResponse.success(res, data, 'Shipping quote generated');
});

// GET /shipping/couriers — couriers with their Reguler/Instan services
const couriers = catchAsync(async (_req, res) => {
  const data = await shippingService.listCouriersWithServices();
  ApiResponse.success(res, data, 'Couriers retrieved');
});

module.exports = { quote, couriers };
