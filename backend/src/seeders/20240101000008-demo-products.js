'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const categories = await queryInterface.sequelize.query(
      `SELECT id, slug FROM categories`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email = 'user@marketplace.com'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const getCategoryId = (slug) => categories.find((c) => c.slug === slug).id;
    const sellerId = users[0].id;

    const products = [
      {
        name: 'Smartphone Samsung Galaxy A54 5G',
        slug: 'smartphone-samsung-galaxy-a54-5g',
        description: 'Smartphone Samsung Galaxy A54 5G dengan layar Super AMOLED 6.4 inch, kamera 50MP, dan baterai 5000mAh. Garansi resmi Samsung Indonesia.',
        price: 5000000.00,
        comparePrice: 5500000.00,
        stock: 50,
        sku: 'ELK-SAM-A54',
        weight: 0.20,
        isActive: true,
        isFeatured: true,
        categorySlug: 'handphone-aksesoris',
      },
      {
        name: 'Kemeja Batik Pria Lengan Panjang',
        slug: 'kemeja-batik-pria-lengan-panjang',
        description: 'Kemeja batik premium dengan bahan katun prima. Cocok untuk acara formal dan semi formal. Tersedia berbagai motif.',
        price: 185000.00,
        comparePrice: null,
        stock: 120,
        sku: 'FPR-BATIK-001',
        weight: 0.25,
        isActive: true,
        isFeatured: false,
        categorySlug: 'fashion-pria',
      },
      {
        name: 'Sepatu Olahraga Nike Air Max',
        slug: 'sepatu-olahraga-nike-air-max',
        description: 'Sepatu lari Nike Air Max dengan teknologi Air-Sole unit untuk kenyamanan maksimal. Ringan dan responsif.',
        price: 1200000.00,
        comparePrice: 1500000.00,
        stock: 35,
        sku: 'OLR-NIKE-AM',
        weight: 0.40,
        isActive: true,
        isFeatured: true,
        categorySlug: 'olahraga',
      },
      {
        name: 'Laptop ASUS ROG Zephyrus G14',
        slug: 'laptop-asus-rog-zephyrus-g14',
        description: 'Laptop gaming ASUS ROG Zephyrus G14 dengan AMD Ryzen 9, RAM 16GB, SSD 512GB, dan GPU NVIDIA RTX 4060.',
        price: 22000000.00,
        comparePrice: 25000000.00,
        stock: 10,
        sku: 'KOM-ASUS-ROG',
        weight: 1.70,
        isActive: true,
        isFeatured: true,
        categorySlug: 'komputer-laptop',
      },
      {
        name: 'Vitamin C Serum Wajah',
        slug: 'vitamin-c-serum-wajah',
        description: 'Serum wajah dengan kandungan Vitamin C 20% yang mencerahkan dan meratakan warna kulit. Cocok untuk semua jenis kulit.',
        price: 85000.00,
        comparePrice: 100000.00,
        stock: 200,
        sku: 'KCT-VITC-001',
        weight: 0.05,
        isActive: true,
        isFeatured: false,
        categorySlug: 'kecantikan',
      },
      {
        name: 'TV LED Samsung 43 Inch 4K UHD',
        slug: 'tv-led-samsung-43-inch-4k-uhd',
        description: 'TV LED Samsung 43 inch dengan resolusi 4K UHD, HDR, dan Smart TV built-in. Dilengkapi with Tizen OS.',
        price: 4500000.00,
        comparePrice: 5000000.00,
        stock: 25,
        sku: 'ELK-SAM-TV43',
        weight: 8.50,
        isActive: true,
        isFeatured: false,
        categorySlug: 'elektronik',
      },
      {
        name: 'Dress Wanita Polos Modern',
        slug: 'dress-wanita-polos-modern',
        description: 'Dress wanita polos dengan potongan modern. Bahan rayon premium yang adem dan nyaman dipakai sehari-hari.',
        price: 150000.00,
        comparePrice: null,
        stock: 80,
        sku: 'FWN-DRESS-001',
        weight: 0.20,
        isActive: true,
        isFeatured: false,
        categorySlug: 'fashion-wanita',
      },
      {
        name: 'Susu Kental Manis Frisian Flag 540g',
        slug: 'susu-kental-manis-frisian-flag-540g',
        description: 'Susu kental manis Frisian Flag kemasan kaleng 540 gram. Cocok untuk minuman dan campuran kue.',
        price: 15000.00,
        comparePrice: null,
        stock: 500,
        sku: 'MKM-FF-540',
        weight: 0.54,
        isActive: true,
        isFeatured: false,
        categorySlug: 'makanan-minuman',
      },
      {
        name: 'Set Peralatan Masak Stainless Steel 12 Pcs',
        slug: 'set-peralatan-masak-stainless-steel-12-pcs',
        description: 'Set peralatan masak stainless steel 12 pieces. Termasuk panci, wajan, dan perlengkapan dapur lainnya. Kualitas premium.',
        price: 350000.00,
        comparePrice: 450000.00,
        stock: 40,
        sku: 'RMT-SET-001',
        weight: 3.00,
        isActive: true,
        isFeatured: false,
        categorySlug: 'rumah-tangga',
      },
      {
        name: 'Multivitamin Imboost 30 Tablet',
        slug: 'multivitamin-imboost-30-tablet',
        description: 'Multivitamin Imboost untuk menjaga daya tahan tubuh. Mengandung echinacea, zinc, dan vitamin C.',
        price: 45000.00,
        comparePrice: null,
        stock: 300,
        sku: 'KST-IMB-001',
        weight: 0.05,
        isActive: true,
        isFeatured: false,
        categorySlug: 'kesehatan',
      },
      {
        name: 'Mainan Lego Classic Bricks 1000 Pcs',
        slug: 'mainan-lego-classic-bricks-1000-pcs',
        description: 'Mainan Lego Classic Bricks 1000 pieces. Membangun kreativitas anak dengan berbagai warna dan bentuk.',
        price: 650000.00,
        comparePrice: 750000.00,
        stock: 60,
        sku: 'MAIN-LEGO-001',
        weight: 1.20,
        isActive: true,
        isFeatured: false,
        categorySlug: 'mainan-hobi',
      },
      {
        name: 'Oli Motor Yamalube 0.8L',
        slug: 'oli-motor-yamalube-08l',
        description: 'Oli motor Yamalube 0.8 liter untuk motor matic dan bebek. Memberikan perlindungan mesin optimal.',
        price: 45000.00,
        comparePrice: null,
        stock: 150,
        sku: 'OTO-YML-001',
        weight: 0.80,
        isActive: true,
        isFeatured: false,
        categorySlug: 'otomotif',
      },
    ];

    const formattedProducts = products.map((p) => {
      const { categorySlug, ...productData } = p;
      return {
        ...productData,
        id: uuidv4(),
        categoryId: getCategoryId(categorySlug),
        sellerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    await queryInterface.bulkInsert('products', formattedProducts);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('products', {
      slug: {
        [Sequelize.Op.in]: [
          'smartphone-samsung-galaxy-a54-5g',
          'kemeja-batik-pria-lengan-panjang',
          'sepatu-olahraga-nike-air-max',
          'laptop-asus-rog-zephyrus-g14',
          'vitamin-c-serum-wajah',
          'tv-led-samsung-43-inch-4k-uhd',
          'dress-wanita-polos-modern',
          'susu-kental-manis-frisian-flag-540g',
          'set-peralatan-masak-stainless-steel-12-pcs',
          'multivitamin-imboost-30-tablet',
          'mainan-lego-classic-bricks-1000-pcs',
          'oli-motor-yamalube-08l',
        ],
      },
    });
  },
};
