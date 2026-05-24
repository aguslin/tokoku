const { Cart, CartItem, Product, ProductImage } = require('../models');
const ApiError = require('../utils/ApiError');

const findByUserId = async (userId) => {
  try {
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: 'CartItems',
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'slug', 'price', 'stock', 'isActive'],
              include: [
                {
                  model: ProductImage,
                  attributes: ['url', 'isPrimary'],
                  where: { isPrimary: true },
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!cart) {
      return await Cart.create({ userId });
    }

    return cart;
  } catch (error) {
    throw ApiError.internal('Error finding cart');
  }
};

const create = async (data) => {
  try {
    const existing = await Cart.findOne({ where: { userId: data.userId } });
    if (existing) {
      return existing;
    }
    return await Cart.create(data);
  } catch (error) {
    throw ApiError.internal('Error creating cart');
  }
};

const addItem = async (cartId, itemData) => {
  try {
    const cart = await Cart.findByPk(cartId);
    if (!cart) {
      throw ApiError.notFound('Cart not found');
    }

    const existingItem = await CartItem.findOne({
      where: { cartId, productId: itemData.productId, variantId: itemData.variantId || null },
    });

    if (existingItem) {
      existingItem.quantity += itemData.quantity || 1;
      await existingItem.save();
      return existingItem;
    }

    return await CartItem.create({
      cartId,
      productId: itemData.productId,
      variantId: itemData.variantId || null,
      quantity: itemData.quantity || 1,
      price: itemData.price,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error adding item to cart');
  }
};

const updateItem = async (itemId, quantity) => {
  try {
    const item = await CartItem.findByPk(itemId);
    if (!item) {
      throw ApiError.notFound('Cart item not found');
    }
    if (quantity < 1) {
      throw ApiError.unprocessable('Quantity must be at least 1');
    }
    await item.update({ quantity });
    return item;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error updating cart item');
  }
};

const removeItem = async (itemId) => {
  try {
    const item = await CartItem.findByPk(itemId);
    if (!item) {
      throw ApiError.notFound('Cart item not found');
    }
    await item.destroy();
    return item;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error removing cart item');
  }
};

const clearCart = async (cartId) => {
  try {
    const cart = await Cart.findByPk(cartId);
    if (!cart) {
      throw ApiError.notFound('Cart not found');
    }
    await CartItem.destroy({ where: { cartId } });
    return cart;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error clearing cart');
  }
};

module.exports = {
  findByUserId,
  create,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
