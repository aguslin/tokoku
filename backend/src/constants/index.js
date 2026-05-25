const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
});

const PAYMENT_METHODS = Object.freeze({
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PAYPAL: 'paypal',
  STRIPE: 'stripe',
  BANK_TRANSFER: 'bank_transfer',
  CASH_ON_DELIVERY: 'cash_on_delivery',
});

const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  SELLER: 'seller',
  BUYER: 'buyer',
});

const COURIERS = Object.freeze({
  FEDEX: 'fedex',
  UPS: 'ups',
  DHL: 'dhl',
  USPS: 'usps',
  OTHER: 'other',
});

const PRODUCT_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
});

const SHIPPING_STATUS = Object.freeze({
  PENDING: 'pending',
  PROCESSING: 'processing',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  RETURNED: 'returned',
});

const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
});

const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

module.exports = {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  USER_ROLES,
  COURIERS,
  PRODUCT_STATUS,
  SHIPPING_STATUS,
  HTTP_STATUS,
  PAGINATION,
};
