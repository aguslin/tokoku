const db = require('../models');
const ApiError = require('../utils/ApiError');
const { PAYMENT_STATUS, ORDER_STATUS } = require('../constants');

const { Payment, PaymentMethod, Order } = db;

const createPayment = async (orderId, paymentMethodId) => {
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.status === ORDER_STATUS.CANCELLED) {
    throw ApiError.badRequest('Cannot create payment for cancelled order');
  }

  const existingPayment = await Payment.findOne({
    where: { orderId, status: PAYMENT_STATUS.PAID },
  });
  if (existingPayment) {
    throw ApiError.badRequest('Order has already been paid');
  }

  const paymentMethod = await PaymentMethod.findByPk(paymentMethodId);
  if (!paymentMethod) {
    throw ApiError.notFound('Payment method not found');
  }
  if (!paymentMethod.isActive) {
    throw ApiError.badRequest('Payment method is not active');
  }

  const expiredAt = new Date();
  expiredAt.setHours(expiredAt.getHours() + 24);

  const payment = await Payment.create({
    orderId,
    paymentMethodId,
    amount: order.total,
    status: PAYMENT_STATUS.PENDING,
    expiredAt,
  });

  return payment;
};

const processPayment = async (paymentId, transactionId) => {
  const payment = await Payment.findByPk(paymentId, {
    include: [{ model: Order, as: 'Order' }],
  });
  if (!payment) {
    throw ApiError.notFound('Payment not found');
  }

  if (payment.status !== PAYMENT_STATUS.PENDING) {
    throw ApiError.badRequest('Payment cannot be processed');
  }

  if (payment.expiredAt && new Date(payment.expiredAt) < new Date()) {
    await payment.update({ status: PAYMENT_STATUS.FAILED });
    throw ApiError.badRequest('Payment has expired');
  }

  const paymentSuccessful = Math.random() > 0.1;

  if (paymentSuccessful) {
    await payment.update({
      status: PAYMENT_STATUS.PAID,
      paidAt: new Date(),
      transactionId: transactionId || `TXN-${Date.now()}`,
    });

    await Order.update(
      { status: ORDER_STATUS.CONFIRMED, paidAt: new Date() },
      { where: { id: payment.orderId } },
    );
  } else {
    await payment.update({ status: PAYMENT_STATUS.FAILED });
  }

  return payment;
};

const getPaymentByOrder = async (orderId) => {
  const payment = await Payment.findOne({
    where: { orderId },
    include: [{ model: PaymentMethod, as: 'PaymentMethod' }],
    order: [['createdAt', 'DESC']],
  });
  if (!payment) {
    throw ApiError.notFound('Payment not found for this order');
  }
  return payment;
};

const submitPaymentProof = async (orderId, userId, proofUrl) => {
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.userId !== userId) {
    throw ApiError.forbidden('Not authorized to submit payment for this order');
  }

  if (order.status === ORDER_STATUS.CANCELLED) {
    throw ApiError.badRequest('Cannot submit payment for cancelled order');
  }

  let payment = await Payment.findOne({
    where: { orderId, status: PAYMENT_STATUS.PENDING },
    order: [['createdAt', 'DESC']],
  });

  if (!payment) {
    payment = await Payment.create({
      orderId,
      amount: order.total,
      status: PAYMENT_STATUS.PENDING,
      metadata: { proofUrl },
    });
  }

  const metadata = payment.metadata || {};
  metadata.proofUrl = proofUrl;
  metadata.submittedAt = new Date().toISOString();

  await payment.update({
    status: PAYMENT_STATUS.PAID,
    paidAt: new Date(),
    transactionId: `MANUAL-${Date.now()}`,
    metadata,
  });

  await Order.update(
    { status: ORDER_STATUS.CONFIRMED, paidAt: new Date() },
    { where: { id: orderId } },
  );

  return payment;
};

module.exports = {
  createPayment,
  processPayment,
  getPaymentByOrder,
  submitPaymentProof,
};
