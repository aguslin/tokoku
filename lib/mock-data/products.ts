export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  sold: number;
  image: string;
  images: string[];
  category: string;
  seller: {
    id: string;
    name: string;
    verified: boolean;
    rating: number;
    followers: number;
  };
  stock: number;
  badge?: 'flash-sale' | 'trending' | 'new' | 'limited';
  discount?: number;
  deliveryDays: number;
  specs?: Record<string, string>;
}

export interface Seller {
  id: string;
  name: string;
  verified: boolean;
  rating: number;
  followers: number;
  joined: string;
  responseTime: string;
  image: string;
}

export const MOCK_SELLERS: Seller[] = [
  {
    id: 'seller-1',
    name: 'Toko Elektronik Terpercaya',
    verified: true,
    rating: 4.8,
    followers: 12500,
    joined: '2021-03-15',
    responseTime: '<2 jam',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
  {
    id: 'seller-2',
    name: 'Fashion Pilihan Indonesia',
    verified: true,
    rating: 4.6,
    followers: 8900,
    joined: '2021-06-20',
    responseTime: '<1 jam',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    id: 'seller-3',
    name: 'Rumah Jaya Online',
    verified: false,
    rating: 4.4,
    followers: 5200,
    joined: '2022-01-10',
    responseTime: '<4 jam',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Headphone Wireless Premium',
    description: 'Headphone noise-canceling dengan baterai 30 jam',
    price: 1299000,
    originalPrice: 1999000,
    rating: 4.7,
    reviewCount: 2341,
    sold: 15400,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&h=400&fit=crop',
    ],
    category: 'Elektronik',
    seller: MOCK_SELLERS[0],
    stock: 250,
    badge: 'flash-sale',
    discount: 35,
    deliveryDays: 2,
    specs: {
      'Daya Tahan Baterai': '30 jam',
      'Noise Cancellation': 'Aktif',
      'Bluetooth': '5.0',
      'Berat': '250g',
    },
  },
  {
    id: 'prod-2',
    name: 'Kaos Katun Klasik',
    description: 'Kaos katun 100% nyaman untuk pemakaian sehari-hari',
    price: 199000,
    rating: 4.5,
    reviewCount: 1205,
    sold: 8900,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    ],
    category: 'Fashion',
    seller: MOCK_SELLERS[1],
    stock: 500,
    badge: 'trending',
    deliveryDays: 1,
    specs: {
      'Material': '100% Katun',
      'Ukuran': 'XS-XXL',
      'Warna': '12 pilihan',
    },
  },
  {
    id: 'prod-3',
    name: 'Pembuat Kopi Stainless Steel',
    description: 'Mesin kopi profesional dengan tabung thermal',
    price: 499000,
    originalPrice: 699000,
    rating: 4.6,
    reviewCount: 892,
    sold: 3450,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=400&h=400&fit=crop',
    ],
    category: 'Rumah Tangga',
    seller: MOCK_SELLERS[2],
    stock: 120,
    discount: 29,
    deliveryDays: 3,
    specs: {
      'Kapasitas': '12 cangkir',
      'Material': 'Stainless Steel',
      'Garansi': '2 tahun',
    },
  },
  {
    id: 'prod-4',
    name: 'Stand Laptop Ultra Tipis',
    description: 'Stand aluminium ringan untuk ergonomi lebih baik',
    price: 349000,
    rating: 4.8,
    reviewCount: 567,
    sold: 2890,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    ],
    category: 'Elektronik',
    seller: MOCK_SELLERS[0],
    stock: 180,
    badge: 'new',
    deliveryDays: 2,
    specs: {
      'Material': 'Aluminium',
      'Kompatibilitas': 'Semua laptop 11"-17"',
      'Berat': '450g',
    },
  },
  {
    id: 'prod-5',
    name: 'Mouse Wireless Ergonomis',
    description: 'Mouse wireless dengan desain ergonomis yang nyaman',
    price: 249000,
    originalPrice: 349000,
    rating: 4.7,
    reviewCount: 1567,
    sold: 12300,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop',
    ],
    category: 'Elektronik',
    seller: MOCK_SELLERS[0],
    stock: 300,
    discount: 28,
    deliveryDays: 1,
    specs: {
      'Koneksi': 'Wireless 2.4GHz',
      'Baterai': '12 bulan',
      'DPI': '3200',
    },
  },
];

export const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Elektronik', icon: '📱' },
  { id: 'cat-2', name: 'Fashion', icon: '👕' },
  { id: 'cat-3', name: 'Rumah Tangga', icon: '🏠' },
  { id: 'cat-4', name: 'Buku', icon: '📚' },
  { id: 'cat-5', name: 'Olahraga', icon: '⚽' },
  { id: 'cat-6', name: 'Kecantikan', icon: '💄' },
];

export const MOCK_TESTIMONIALS = [
  {
    id: 'test-1',
    author: 'Sarah Maulida',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
    text: 'Pengalaman belanja luar biasa! Pengiriman cepat dan layanan pelanggan sangat baik.',
  },
  {
    id: 'test-2',
    author: 'Budi Santoso',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5,
    text: 'Pilihan produk lengkap dan harga sangat kompetitif.',
  },
  {
    id: 'test-3',
    author: 'Rina Wijaya',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 4,
    text: 'Kualitas produk bagus. Selalu menjadi pilihan pertama saya untuk belanja online.',
  },
];

export const MOCK_VOUCHERS = [
  {
    id: 'voucher-1',
    code: 'SELAMAT20',
    discountType: 'percentage' as const,
    discountValue: 20,
    minPurchase: 500000,
    used: 1200,
    usageLimit: 5000,
    expiresAt: '2024-12-31',
    isActive: true,
  },
  {
    id: 'voucher-2',
    code: 'DISKON50',
    discountType: 'fixed' as const,
    discountValue: 50000,
    minPurchase: 2000000,
    maxDiscount: 50000,
    used: 3400,
    usageLimit: 10000,
    expiresAt: '2024-08-31',
    isActive: true,
  },
];
