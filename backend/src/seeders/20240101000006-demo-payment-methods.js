'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('payment_methods', [
      {
        id: uuidv4(),
        name: 'BCA Virtual Account',
        code: 'bca_va',
        type: 'virtual_account',
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Mandiri Virtual Account',
        code: 'mandiri_va',
        type: 'virtual_account',
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'BNI Virtual Account',
        code: 'bni_va',
        type: 'virtual_account',
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'OVO',
        code: 'ovo',
        type: 'e_wallet',
        isActive: true,
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'GoPay',
        code: 'gopay',
        type: 'e_wallet',
        isActive: true,
        sortOrder: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'DANA',
        code: 'dana',
        type: 'e_wallet',
        isActive: true,
        sortOrder: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'QRIS',
        code: 'qris',
        type: 'qris',
        isActive: true,
        sortOrder: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('payment_methods', {
      code: {
        [Sequelize.Op.in]: [
          'bca_va', 'mandiri_va', 'bni_va', 'ovo', 'gopay', 'dana', 'qris',
        ],
      },
    });
  },
};
