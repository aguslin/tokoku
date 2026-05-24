const db = require('../models');
const ApiError = require('../utils/ApiError');

const { Cart, CartItem, Product, ProductVariant, ProductImage } = db;

const cartIncludes = [
  {
    model: CartItem,
    as: 'CartItems',
    include: [
      {
        model: Product,
        as: 'Product',
        attributes: ['id', 'name', 'slug', 'price', 'stock', 'isActive'],
        include: [
          {
            model: ProductImage,
            as: 'ProductImages',
            attributes: ['id', 'url', 'alt', 'isPrimary'],
            where: { isPrimary: true },
            required: false,
          },
        ],
      },
      {
        model: ProductVariant,
        as: 'ProductVariant',
        attributes: ['id', 'name', 'sku', 'price', 'stock'],
      },
    ],
  },
];

const getOrCreateCart = async (userId) => {
  const [cart] = await Cart.findOrCreate({ where: { userId } });
  return cart;
};

const getCart = async (userId) => {
  const cart = await Cart.findOne({
    where: { userId },
    include: cartIncludes,
  });

  if (!cart) {
    return await getOrCreateCart(userId);
  }

  return cart;
};

const addItem = async (userId, { productId, variantId, quantity }) => {
  const product = await Product.findByPk(productId, {
    attributes: ['id', 'name', 'price', 'stock', 'isActive'],
  });
  if (!product) {
    throw ApiError.notFound('Product not found');
  }
  if (!product.isActive) {
    throw ApiError.badRequest('Product is not available');
  }

  let price = parseFloat(product.price);
  let currentStock = product.stock;

  if (variantId) {
    const variant = await ProductVariant.findByPk(variantId);
    if (!variant) {
      throw ApiError.notFound('Product variant not found');
    }
    if (!variant.isActive) {
      throw ApiError.badRequest('Product variant is not available');
    }
    price = variant.price ? parseFloat(variant.price) : price;
    currentStock = variant.stock;
  }

  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  if (qty > currentStock) {
    throw ApiError.badRequest('Insufficient stock');
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = await CartItem.findOne({
    where: { cartId: cart.id, productId, variantId: variantId || null },
  });

  if (existingItem) {
    const newQty = existingItem.quantity + qty;
    if (newQty > currentStock) {
      throw ApiError.badRequest('Insufficient stock for requested quantity');
    }
    await existingItem.update({ quantity: newQty, price });
  } else {
    await CartItem.create({
      cartId: cart.id,
      productId,
      variantId: variantId || null,
      quantity: qty,
      price,
    });
  }

  return getCart(userId);
};

const updateItem = async (userId, itemId, quantity) => {
  const cart = await Cart.findOne({ where: { userId } });
  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  const item = await CartItem.findOne({
    where: { id: itemId, cartId: cart.id },
    include: [
      { model: Product, as: 'Product', attributes: ['id', 'stock', 'isActive'] },
      { model: ProductVariant, as: 'ProductVariant', attributes: ['id', 'stock'] },
    ],
  });
  if (!item) {
    throw ApiError.notFound('Cart item not found');
  }

  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  let maxStock = item.Product.stock;
  if (item.ProductVariant) {
    maxStock = item.ProductVariant.stock;
  }

  if (qty > maxStock) {
    throw ApiError.badRequest('Insufficient stock');
  }

  await item.update({ quantity: qty });
  return getCart(userId);
};

const removeItem = async (userId, itemId) => {
  const cart = await Cart.findOne({ where: { userId } });
  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  const item = await CartItem.findOne({
    where: { id: itemId, cartId: cart.id },
  });
  if (!item) {
    throw ApiError.notFound('Cart item not found');
  }

  await item.destroy();
  return getCart(userId);
};

const clearCart = async (userId) => {
  const cart = await Cart.findOne({ where: { userId } });
  if (cart) {
    await CartItem.destroy({ where: { cartId: cart.id } });
  }
  return { message: 'Cart cleared successfully' };
};

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
