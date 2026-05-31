'use strict';

const bcrypt = require('bcryptjs');

const UUIDs = {
  roles: {
    admin: '10000000-0000-4000-8000-000000000001',
    user: '10000000-0000-4000-8000-000000000002',
  },
  permissions: {
    create_users: '11000000-0000-4000-8000-000000000001',
    read_users: '11000000-0000-4000-8000-000000000002',
    update_users: '11000000-0000-4000-8000-000000000003',
    delete_users: '11000000-0000-4000-8000-000000000004',
    create_products: '11000000-0000-4000-8000-000000000005',
    read_products: '11000000-0000-4000-8000-000000000006',
    update_products: '11000000-0000-4000-8000-000000000007',
    delete_products: '11000000-0000-4000-8000-000000000008',
    create_categories: '11000000-0000-4000-8000-000000000009',
    read_categories: '11000000-0000-4000-8000-00000000000a',
    update_categories: '11000000-0000-4000-8000-00000000000b',
    delete_categories: '11000000-0000-4000-8000-00000000000c',
    create_orders: '11000000-0000-4000-8000-00000000000d',
    read_orders: '11000000-0000-4000-8000-00000000000e',
    update_orders: '11000000-0000-4000-8000-00000000000f',
    delete_orders: '11000000-0000-4000-8000-000000000010',
    create_vouchers: '11000000-0000-4000-8000-000000000011',
    read_vouchers: '11000000-0000-4000-8000-000000000012',
    update_vouchers: '11000000-0000-4000-8000-000000000013',
    delete_vouchers: '11000000-0000-4000-8000-000000000014',
    create_reviews: '11000000-0000-4000-8000-000000000015',
    read_reviews: '11000000-0000-4000-8000-000000000016',
    update_reviews: '11000000-0000-4000-8000-000000000017',
    delete_reviews: '11000000-0000-4000-8000-000000000018',
    manage_all: '11000000-0000-4000-8000-000000000019',
  },
  users: {
    admin: '20000000-0000-4000-8000-000000000001',
    buyer: '20000000-0000-4000-8000-000000000002',
  },
  user_roles: {
    admin_role: '30000000-0000-4000-8000-000000000001',
    buyer_role: '30000000-0000-4000-8000-000000000002',
  },
  categories: {
    elektronik: '40000000-0000-4000-8000-000000000001',
    fashion_pria: '40000000-0000-4000-8000-000000000002',
    fashion_wanita: '40000000-0000-4000-8000-000000000003',
    handphone_aksesoris: '40000000-0000-4000-8000-000000000004',
    komputer_laptop: '40000000-0000-4000-8000-000000000005',
    kesehatan: '40000000-0000-4000-8000-000000000006',
    kecantikan: '40000000-0000-4000-8000-000000000007',
    makanan_minuman: '40000000-0000-4000-8000-000000000008',
    rumah_tangga: '40000000-0000-4000-8000-000000000009',
    olahraga: '40000000-0000-4000-8000-00000000000a',
    mainan_hobi: '40000000-0000-4000-8000-00000000000b',
    otomotif: '40000000-0000-4000-8000-00000000000c',
  },
  payment_methods: {
    bca_va: '50000000-0000-4000-8000-000000000001',
    mandiri_va: '50000000-0000-4000-8000-000000000002',
    bni_va: '50000000-0000-4000-8000-000000000003',
    ovo: '50000000-0000-4000-8000-000000000004',
    gopay: '50000000-0000-4000-8000-000000000005',
    dana: '50000000-0000-4000-8000-000000000006',
    qris: '50000000-0000-4000-8000-000000000007',
  },
  couriers: {
    jne: '60000000-0000-4000-8000-000000000001',
    tiki: '60000000-0000-4000-8000-000000000002',
    sicepat: '60000000-0000-4000-8000-000000000003',
    jnt: '60000000-0000-4000-8000-000000000004',
    pos: '60000000-0000-4000-8000-000000000005',
    ninja: '60000000-0000-4000-8000-000000000006',
  },
  products: {
    samsung_a54: '70000000-0000-4000-8000-000000000001',
    kemeja_batik: '70000000-0000-4000-8000-000000000002',
    nike_air_max: '70000000-0000-4000-8000-000000000003',
    asus_rog: '70000000-0000-4000-8000-000000000004',
    vit_c_serum: '70000000-0000-4000-8000-000000000005',
    samsung_tv: '70000000-0000-4000-8000-000000000006',
    dress_wanita: '70000000-0000-4000-8000-000000000007',
    frisian_flag: '70000000-0000-4000-8000-000000000008',
    set_masak: '70000000-0000-4000-8000-000000000009',
    imboost: '70000000-0000-4000-8000-00000000000a',
    lego: '70000000-0000-4000-8000-00000000000b',
    yamalube: '70000000-0000-4000-8000-00000000000c',
  },
};

const R = UUIDs.roles;
const P = UUIDs.permissions;
const U = UUIDs.users;
const UR = UUIDs.user_roles;
const C = UUIDs.categories;
const PM = UUIDs.payment_methods;
const CO = UUIDs.couriers;
const PR = UUIDs.products;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // ========== ROLES ==========
    await queryInterface.bulkInsert('roles', [
      { id: R.admin, name: 'admin', description: 'Administrator dengan akses penuh', createdAt: now, updatedAt: now },
      { id: R.user, name: 'user', description: 'Pengguna biasa', createdAt: now, updatedAt: now },
    ], {});

    // ========== PERMISSIONS ==========
    const resActions = [
      ['users', 'create'], ['users', 'read'], ['users', 'update'], ['users', 'delete'],
      ['products', 'create'], ['products', 'read'], ['products', 'update'], ['products', 'delete'],
      ['categories', 'create'], ['categories', 'read'], ['categories', 'update'], ['categories', 'delete'],
      ['orders', 'create'], ['orders', 'read'], ['orders', 'update'], ['orders', 'delete'],
      ['vouchers', 'create'], ['vouchers', 'read'], ['vouchers', 'update'], ['vouchers', 'delete'],
      ['reviews', 'create'], ['reviews', 'read'], ['reviews', 'update'], ['reviews', 'delete'],
    ];
    const pKeys = Object.keys(P);
    const permissions = resActions.map(([resource, action], i) => ({
      id: P[pKeys[i]],
      name: `${action}_${resource}`,
      resource,
      action,
      description: `${action} ${resource}`,
      createdAt: now,
      updatedAt: now,
    }));
    permissions.push({
      id: P.manage_all,
      name: 'manage_all',
      resource: 'all',
      action: 'manage',
      description: 'Akses penuh ke semua resource',
      createdAt: now,
      updatedAt: now,
    });
    await queryInterface.bulkInsert('permissions', permissions, {});

    // ========== USERS ==========
    const adminPassword = bcrypt.hashSync('Admin123!', 10);
    const userPassword = bcrypt.hashSync('User123!', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: U.admin, email: 'admin@marketplace.com', password: adminPassword,
        name: 'Admin Marketplace', phone: '081234567890', isActive: true,
        createdAt: now, updatedAt: now,
      },
      {
        id: U.buyer, email: 'user@marketplace.com', password: userPassword,
        name: 'Budi Santoso', phone: '081298765432', isActive: true,
        createdAt: now, updatedAt: now,
      },
    ], {});

    // ========== USER ROLES ==========
    await queryInterface.bulkInsert('user_roles', [
      { id: UR.admin_role, userId: U.admin, roleId: R.admin, createdAt: now, updatedAt: now },
      { id: UR.buyer_role, userId: U.buyer, roleId: R.user, createdAt: now, updatedAt: now },
    ], {});

    // ========== CATEGORIES ==========
    const categories = [
      { id: C.elektronik, name: 'Elektronik', slug: 'elektronik', description: 'Produk elektronik seperti TV, audio, dan perangkat elektronik lainnya', sortOrder: 1 },
      { id: C.fashion_pria, name: 'Fashion Pria', slug: 'fashion-pria', description: 'Pakaian dan aksesoris fashion untuk pria', sortOrder: 2 },
      { id: C.fashion_wanita, name: 'Fashion Wanita', slug: 'fashion-wanita', description: 'Pakaian dan aksesoris fashion untuk wanita', sortOrder: 3 },
      { id: C.handphone_aksesoris, name: 'Handphone & Aksesoris', slug: 'handphone-aksesoris', description: 'Handphone, smartphone, dan aksesorisnya', sortOrder: 4 },
      { id: C.komputer_laptop, name: 'Komputer & Laptop', slug: 'komputer-laptop', description: 'Komputer desktop, laptop, dan perlengkapannya', sortOrder: 5 },
      { id: C.kesehatan, name: 'Kesehatan', slug: 'kesehatan', description: 'Produk kesehatan dan alat medis', sortOrder: 6 },
      { id: C.kecantikan, name: 'Kecantikan', slug: 'kecantikan', description: 'Produk kecantikan dan perawatan diri', sortOrder: 7 },
      { id: C.makanan_minuman, name: 'Makanan & Minuman', slug: 'makanan-minuman', description: 'Makanan dan minuman dalam kemasan', sortOrder: 8 },
      { id: C.rumah_tangga, name: 'Rumah Tangga', slug: 'rumah-tangga', description: 'Perlengkapan dan perabotan rumah tangga', sortOrder: 9 },
      { id: C.olahraga, name: 'Olahraga', slug: 'olahraga', description: 'Perlengkapan olahraga dan fitness', sortOrder: 10 },
      { id: C.mainan_hobi, name: 'Mainan & Hobi', slug: 'mainan-hobi', description: 'Mainan dan perlengkapan hobi', sortOrder: 11 },
      { id: C.otomotif, name: 'Otomotif', slug: 'otomotif', description: 'Produk otomotif dan aksesoris kendaraan', sortOrder: 12 },
    ];
    await queryInterface.bulkInsert('categories', categories.map(c => ({
      ...c, image: null, parentId: null, isActive: true, createdAt: now, updatedAt: now,
    })), {});

    // ========== PAYMENT METHODS ==========
    const paymentMethods = [
      { id: PM.bca_va, name: 'BCA Virtual Account', code: 'bca_va', type: 'virtual_account', sortOrder: 1 },
      { id: PM.mandiri_va, name: 'Mandiri Virtual Account', code: 'mandiri_va', type: 'virtual_account', sortOrder: 2 },
      { id: PM.bni_va, name: 'BNI Virtual Account', code: 'bni_va', type: 'virtual_account', sortOrder: 3 },
      { id: PM.ovo, name: 'OVO', code: 'ovo', type: 'e_wallet', sortOrder: 4 },
      { id: PM.gopay, name: 'GoPay', code: 'gopay', type: 'e_wallet', sortOrder: 5 },
      { id: PM.dana, name: 'DANA', code: 'dana', type: 'e_wallet', sortOrder: 6 },
      { id: PM.qris, name: 'QRIS', code: 'qris', type: 'qris', sortOrder: 7 },
    ];
    await queryInterface.bulkInsert('payment_methods', paymentMethods.map(pm => ({
      ...pm, logo: null, isActive: true, createdAt: now, updatedAt: now,
    })), {});

    // ========== COURIERS ==========
    const couriers = [
      { id: CO.jne, name: 'JNE', code: 'jne' },
      { id: CO.tiki, name: 'TIKI', code: 'tiki' },
      { id: CO.sicepat, name: 'SiCepat', code: 'sicepat' },
      { id: CO.jnt, name: 'J&T Express', code: 'jnt' },
      { id: CO.pos, name: 'Pos Indonesia', code: 'pos' },
      { id: CO.ninja, name: 'Ninja Xpress', code: 'ninja' },
    ];
    await queryInterface.bulkInsert('couriers', couriers.map(c => ({
      ...c, logo: null, isActive: true, createdAt: now, updatedAt: now,
    })), {});

    // ========== PRODUCTS ==========
    const products = [
      {
        id: PR.samsung_a54, name: 'Smartphone Samsung Galaxy A54 5G',
        slug: 'smartphone-samsung-galaxy-a54-5g',
        description: 'Smartphone Samsung Galaxy A54 5G dengan layar Super AMOLED 6.4 inch, kamera 50MP, dan baterai 5000mAh. Garansi resmi Samsung Indonesia.',
        price: 5000000.00, comparePrice: 5500000.00, stock: 50,
        sku: 'ELK-SAM-A54', weight: 0.20, isActive: true, isFeatured: true,
        categoryId: C.handphone_aksesoris, sellerId: U.buyer,
      },
      {
        id: PR.kemeja_batik, name: 'Kemeja Batik Pria Lengan Panjang',
        slug: 'kemeja-batik-pria-lengan-panjang',
        description: 'Kemeja batik premium dengan bahan katun prima. Cocok untuk acara formal dan semi formal. Tersedia berbagai motif.',
        price: 185000.00, stock: 120,
        sku: 'FPR-BATIK-001', weight: 0.25, isActive: true, isFeatured: false,
        categoryId: C.fashion_pria, sellerId: U.buyer,
      },
      {
        id: PR.nike_air_max, name: 'Sepatu Olahraga Nike Air Max',
        slug: 'sepatu-olahraga-nike-air-max',
        description: 'Sepatu lari Nike Air Max dengan teknologi Air-Sole unit untuk kenyamanan maksimal. Ringan dan responsif.',
        price: 1200000.00, comparePrice: 1500000.00, stock: 35,
        sku: 'OLR-NIKE-AM', weight: 0.40, isActive: true, isFeatured: true,
        categoryId: C.olahraga, sellerId: U.buyer,
      },
      {
        id: PR.asus_rog, name: 'Laptop ASUS ROG Zephyrus G14',
        slug: 'laptop-asus-rog-zephyrus-g14',
        description: 'Laptop gaming ASUS ROG Zephyrus G14 dengan AMD Ryzen 9, RAM 16GB, SSD 512GB, dan GPU NVIDIA RTX 4060.',
        price: 22000000.00, comparePrice: 25000000.00, stock: 10,
        sku: 'KOM-ASUS-ROG', weight: 1.70, isActive: true, isFeatured: true,
        categoryId: C.komputer_laptop, sellerId: U.buyer,
      },
      {
        id: PR.vit_c_serum, name: 'Vitamin C Serum Wajah',
        slug: 'vitamin-c-serum-wajah',
        description: 'Serum wajah dengan kandungan Vitamin C 20% yang mencerahkan dan meratakan warna kulit. Cocok untuk semua jenis kulit.',
        price: 85000.00, comparePrice: 100000.00, stock: 200,
        sku: 'KCT-VITC-001', weight: 0.05, isActive: true, isFeatured: false,
        categoryId: C.kecantikan, sellerId: U.buyer,
      },
      {
        id: PR.samsung_tv, name: 'TV LED Samsung 43 Inch 4K UHD',
        slug: 'tv-led-samsung-43-inch-4k-uhd',
        description: 'TV LED Samsung 43 inch dengan resolusi 4K UHD, HDR, dan Smart TV built-in. Dilengkapi with Tizen OS.',
        price: 4500000.00, comparePrice: 5000000.00, stock: 25,
        sku: 'ELK-SAM-TV43', weight: 8.50, isActive: true, isFeatured: false,
        categoryId: C.elektronik, sellerId: U.buyer,
      },
      {
        id: PR.dress_wanita, name: 'Dress Wanita Polos Modern',
        slug: 'dress-wanita-polos-modern',
        description: 'Dress wanita polos dengan potongan modern. Bahan rayon premium yang adem dan nyaman dipakai sehari-hari.',
        price: 150000.00, stock: 80,
        sku: 'FWN-DRESS-001', weight: 0.20, isActive: true, isFeatured: false,
        categoryId: C.fashion_wanita, sellerId: U.buyer,
      },
      {
        id: PR.frisian_flag, name: 'Susu Kental Manis Frisian Flag 540g',
        slug: 'susu-kental-manis-frisian-flag-540g',
        description: 'Susu kental manis Frisian Flag kemasan kaleng 540 gram. Cocok untuk minuman dan campuran kue.',
        price: 15000.00, stock: 500,
        sku: 'MKM-FF-540', weight: 0.54, isActive: true, isFeatured: false,
        categoryId: C.makanan_minuman, sellerId: U.buyer,
      },
      {
        id: PR.set_masak, name: 'Set Peralatan Masak Stainless Steel 12 Pcs',
        slug: 'set-peralatan-masak-stainless-steel-12-pcs',
        description: 'Set peralatan masak stainless steel 12 pieces. Termasuk panci, wajan, dan perlengkapan dapur lainnya. Kualitas premium.',
        price: 350000.00, comparePrice: 450000.00, stock: 40,
        sku: 'RMT-SET-001', weight: 3.00, isActive: true, isFeatured: false,
        categoryId: C.rumah_tangga, sellerId: U.buyer,
      },
      {
        id: PR.imboost, name: 'Multivitamin Imboost 30 Tablet',
        slug: 'multivitamin-imboost-30-tablet',
        description: 'Multivitamin Imboost untuk menjaga daya tahan tubuh. Mengandung echinacea, zinc, dan vitamin C.',
        price: 45000.00, stock: 300,
        sku: 'KST-IMB-001', weight: 0.05, isActive: true, isFeatured: false,
        categoryId: C.kesehatan, sellerId: U.buyer,
      },
      {
        id: PR.lego, name: 'Mainan Lego Classic Bricks 1000 Pcs',
        slug: 'mainan-lego-classic-bricks-1000-pcs',
        description: 'Mainan Lego Classic Bricks 1000 pieces. Membangun kreativitas anak dengan berbagai warna dan bentuk.',
        price: 650000.00, comparePrice: 750000.00, stock: 100,
        sku: 'MAIN-LEGO-001', weight: 1.20, isActive: true, isFeatured: true,
        categoryId: C.mainan_hobi, sellerId: U.buyer,
      },
      {
        id: PR.yamalube, name: 'Oli Motor Yamalube 0.8L',
        slug: 'oli-motor-yamalube-08l',
        description: 'Oli motor Yamalube 0.8 liter untuk motor matic dan bebek. Memberikan perlindungan mesin optimal.',
        price: 45000.00, stock: 150,
        sku: 'OTO-YML-001', weight: 0.80, isActive: true, isFeatured: false,
        categoryId: C.otomotif, sellerId: U.buyer,
      },
    ];
    await queryInterface.bulkInsert('products', products.map(p => ({
      ...p, comparePrice: p.comparePrice || null, sold: 0, createdAt: now, updatedAt: now,
    })), {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('product_images', {}, {});
    await queryInterface.bulkDelete('product_variants', {}, {});
    await queryInterface.bulkDelete('products', {}, {});
    await queryInterface.bulkDelete('couriers', {}, {});
    await queryInterface.bulkDelete('payment_methods', {}, {});
    await queryInterface.bulkDelete('categories', {}, {});
    await queryInterface.bulkDelete('user_roles', {}, {});
    await queryInterface.bulkDelete('users', {}, {});
    await queryInterface.bulkDelete('permissions', {}, {});
    await queryInterface.bulkDelete('roles', {}, {});
  },
};
