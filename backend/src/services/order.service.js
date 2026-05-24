const db = require('../models');
const ApiError = require('../utils/ApiError');
const { ORDER_STATUS } = require('../constants');
const { getPagination, getPaginationMeta } = require('../helpers/pagination');

const { Order, OrderItem, Cart, CartItem, Product, ProductVariant, Address, Courier, Voucher, VoucherUsage, Review } = db;

const generateOrderNumber = () => {
  const date = new Date();
  const y = date.getFullYear().toString();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${y}${m}${d}-${rand}`;
};

const orderIncludes = [
  {
    model: OrderItem,
    as: 'OrderItems',
    include: [
      { model: Product, as: 'Product', attributes: ['id', 'name', 'slug'] },
      { model: ProductVariant, as: 'ProductVariant', attributes: ['id', 'name'] },
    ],
  },
  { model: Address, as: 'Address' },
  { model: Courier, as: 'Courier' },
];

const createOrder = async (userId, { addressId, courierId, voucherCode, items, notes }) => {
  if (items && Array.isArray(items) && items.length > 0) {
    return createOrderFromItems(userId, { addressId, courierId, voucherCode, items, notes });
  }
  return createOrderFromCart(userId, { addressId, courierId, voucherCode, notes });
};

const createOrderFromCart = async (userId, { addressId, courierId, voucherCode, notes }) => {
  const cart = await Cart.findOne({
    where: { userId },
    include: [
      {
        model: CartItem,
        as: 'CartItems',
        include: [
          { model: Product, as: 'Product', attributes: ['id', 'name', 'slug', 'price', 'stock', 'isActive'] },
          { model: ProductVariant, as: 'ProductVariant', attributes: ['id', 'name', 'price', 'stock', 'isActive'] },
        ],
      },
    ],
  });

  if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
    throw ApiError.badRequest('Cart is empty');
  }

  const address = await Address.findOne({ where: { id: addressId, userId } });
  if (!address) {
    throw ApiError.notFound('Address not found');
  }

  let courier = null;
  if (courierId) {
    courier = await Courier.findByPk(courierId);
    if (!courier) {
      throw ApiError.notFound('Courier not found');
    }
  }

  let subtotal = 0;
  const orderItems = [];

  for (const cartItem of cart.CartItems) {
    if (!cartItem.Product.isActive) {
      throw ApiError.badRequest(`Product "${cartItem.Product.name}" is not available`);
    }

    let price = parseFloat(cartItem.Product.price);
    let currentStock = cartItem.Product.stock;

    if (cartItem.ProductVariant) {
      if (!cartItem.ProductVariant.isActive) {
        throw ApiError.badRequest(`Variant "${cartItem.ProductVariant.name}" is not available`);
      }
      price = cartItem.ProductVariant.price ? parseFloat(cartItem.ProductVariant.price) : price;
      currentStock = cartItem.ProductVariant.stock;
    }

    if (cartItem.quantity > currentStock) {
      throw ApiError.badRequest(`Insufficient stock for "${cartItem.Product.name}"`);
    }

    const itemSubtotal = price * cartItem.quantity;
    subtotal += itemSubtotal;

    orderItems.push({
      productId: cartItem.productId,
      variantId: cartItem.variantId,
      productName: cartItem.Product.name,
      price,
      quantity: cartItem.quantity,
      subtotal: itemSubtotal,
    });
  }

  return finalizeOrder(userId, { address, courier, voucherCode, notes, subtotal, orderItems, cart });
};

const createOrderFromItems = async (userId, { addressId, courierId, voucherCode, items, notes }) => {
  const address = await Address.findOne({ where: { id: addressId, userId } });
  if (!address) {
    throw ApiError.notFound('Address not found');
  }

  let courier = null;
  if (courierId) {
    courier = await Courier.findByPk(courierId);
    if (!courier) {
      throw ApiError.notFound('Courier not found');
    }
  }

  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findByPk(item.productId, {
      attributes: ['id', 'name', 'slug', 'price', 'stock', 'isActive'],
    });
    if (!product) {
      throw ApiError.notFound(`Product with id "${item.productId}" not found`);
    }
    if (!product.isActive) {
      throw ApiError.badRequest(`Product "${product.name}" is not available`);
    }

    let price = parseFloat(product.price);
    let currentStock = product.stock;

    if (item.variantId) {
      const variant = await ProductVariant.findByPk(item.variantId);
      if (!variant) {
        throw ApiError.notFound('Product variant not found');
      }
      if (!variant.isActive) {
        throw ApiError.badRequest('Product variant is not available');
      }
      price = variant.price ? parseFloat(variant.price) : price;
      currentStock = variant.stock;
    }

    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    if (qty > currentStock) {
      throw ApiError.badRequest(`Insufficient stock for "${product.name}"`);
    }

    const itemSubtotal = price * qty;
    subtotal += itemSubtotal;

    orderItems.push({
      productId: product.id,
      variantId: item.variantId || null,
      productName: product.name,
      price,
      quantity: qty,
      subtotal: itemSubtotal,
    });
  }

  return finalizeOrder(userId, { address, courier, voucherCode, notes, subtotal, orderItems, cart: null });
};

const finalizeOrder = async (userId, { address, courier, voucherCode, notes, subtotal, orderItems, cart }) => {
  let voucherDiscount = 0;
  if (voucherCode) {
    const { voucher, discount } = await validateAndApplyVoucher(voucherCode, userId, subtotal);
    voucherDiscount = discount;
  }

  const shippingCost = courier ? 10000 : 0;
  const total = subtotal - voucherDiscount + shippingCost;

  const orderNumber = generateOrderNumber();

  const order = await Order.create({
    userId,
    orderNumber,
    status: ORDER_STATUS.PENDING,
    subtotal,
    shippingCost,
    voucherDiscount,
    total,
    notes: notes || null,
    addressId: address.id,
    courierId: courier ? courier.id : null,
  });

  await OrderItem.bulkCreate(
    orderItems.map((item) => ({
      ...item,
      orderId: order.id,
    })),
  );

  if (voucherCode) {
    const voucher = await Voucher.findOne({ where: { code: voucherCode } });
    if (voucher) {
      await VoucherUsage.create({
        voucherId: voucher.id,
        userId,
        orderId: order.id,
      });
      await voucher.increment('usedCount');
    }
  }

  if (cart) {
    await CartItem.destroy({ where: { cartId: cart.id } });
  }

  return getOrderById(order.id, userId);
};

const validateAndApplyVoucher = async (code, userId, orderTotal) => {
  const voucher = await Voucher.findOne({ where: { code, isActive: true } });
  if (!voucher) {
    throw ApiError.notFound('Voucher not found or inactive');
  }

  const now = new Date();
  if (voucher.startsAt && new Date(voucher.startsAt) > now) {
    throw ApiError.badRequest('Voucher is not yet active');
  }
  if (voucher.endsAt && new Date(voucher.endsAt) < now) {
    throw ApiError.badRequest('Voucher has expired');
  }

  if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
    throw ApiError.badRequest('Voucher usage limit reached');
  }

  if (orderTotal < parseFloat(voucher.minOrder || 0)) {
    throw ApiError.badRequest(`Minimum order of ${voucher.minOrder} required for this voucher`);
  }

  const userUsageCount = await VoucherUsage.count({
    where: { voucherId: voucher.id, userId },
  });
  if (userUsageCount > 0) {
    throw ApiError.badRequest('Voucher already used');
  }

  let discount = 0;
  if (voucher.type === 'percentage') {
    discount = (orderTotal * parseFloat(voucher.value)) / 100;
    if (voucher.maxDiscount) {
      discount = Math.min(discount, parseFloat(voucher.maxDiscount));
    }
  } else {
    discount = parseFloat(voucher.value);
  }

  discount = Math.min(discount, orderTotal);

  return { voucher, discount };
};

const getOrderById = async (orderId, userId) => {
  const order = await Order.findByPk(orderId, {
    include: orderIncludes,
  });
  if (!order) {
    throw ApiError.notFound('Order not found');
  }
  if (order.userId !== userId) {
    throw ApiError.forbidden('You are not authorized to view this order');
  }
  return order;
};

const getUserOrders = async (userId, query) => {
  const { page, limit, offset } = getPagination(query);
  const { status } = query;

  const where = { userId };
  if (status) {
    where.status = status;
  }

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: orderIncludes,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
  });

  return { orders: rows, meta: getPaginationMeta(count, page, limit) };
};

const getAllOrders = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const { status, userId, search } = query;

  const where = {};
  if (status) {
    where.status = status;
  }
  if (userId) {
    where.userId = userId;
  }

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      ...orderIncludes,
      { model: db.User, as: 'User', attributes: ['id', 'name', 'email'] },
    ],
    offset,
    limit,
    order: [['createdAt', 'DESC']],
  });

  return { orders: rows, meta: getPaginationMeta(count, page, limit) };
};

const updateStatus = async (orderId, status) => {
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  const validTransitions = {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
    [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.REFUNDED],
  };

  const allowed = validTransitions[order.status];
  if (!allowed || !allowed.includes(status)) {
    throw ApiError.badRequest(`Cannot transition from ${order.status} to ${status}`);
  }

  const updates = { status };
  if (status === ORDER_STATUS.DELIVERED) {
    updates.deliveredAt = new Date();
  }
  if (status === ORDER_STATUS.CANCELLED) {
    updates.cancelledAt = new Date();
  }

  await order.update(updates);
  return getOrderById(orderId, order.userId);
};

const cancelOrder = async (orderId, userId, reason) => {
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }
  if (order.userId !== userId) {
    throw ApiError.forbidden('You are not authorized to cancel this order');
  }

  const cancellableStatuses = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED];
  if (!cancellableStatuses.includes(order.status)) {
    throw ApiError.badRequest('Order cannot be cancelled at this stage');
  }

  await order.update({
    status: ORDER_STATUS.CANCELLED,
    cancelledAt: new Date(),
    cancellationReason: reason || null,
  });

  return getOrderById(orderId, userId);
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateStatus,
  cancelOrder,
};
