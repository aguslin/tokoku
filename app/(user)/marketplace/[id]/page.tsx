'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, ArrowLeft, Check, Truck, Shield, Package } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { Badge } from '@/components/shared/badge';
import { RatingStars } from '@/components/shared/rating-stars';
import { formatCurrency } from '@/lib/utils/currency';
import { MOCK_PRODUCTS } from '@/lib/mock-data/products';
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const product = MOCK_PRODUCTS.find((p) => p.id === params.id);
  const { addItem } = useCartStore();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Produk tidak ditemukan</p>
          <Link href="/marketplace">
            <Button>Kembali ke Marketplace</Button>
          </Link>
        </div>
      </main>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      price: product.price,
      quantity,
      sellerName: product.seller.name,
      sellerVerified: product.seller.verified,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      price: product.price,
      quantity,
      sellerName: product.seller.name,
      sellerVerified: product.seller.verified,
    });
    router.push('/checkout');
  };

  const toggleWishlist = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isInWishlist(product.id)) {
      removeWishlist(product.id);
    } else {
      addWishlist({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        price: product.price,
      });
    }
  };

  const images = product.images.length > 0 ? product.images : [product.image];

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/marketplace">
              <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />} size="sm">
                Kembali
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Detail Produk</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative h-80 lg:h-96 bg-muted rounded-xl overflow-hidden">
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {product.badge && (
                <Badge
                  variant={product.badge === 'flash-sale' ? 'destructive' : product.badge === 'trending' ? 'warning' : 'info'}
                  className="absolute top-4 right-4"
                >
                  {product.badge === 'flash-sale' ? 'Flash Sale' : product.badge === 'trending' ? 'Trending' : 'Baru'}
                </Badge>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                <Link href="/marketplace" className="hover:text-primary">{product.category}</Link>
                <span className="mx-2">/</span>
                {product.seller.name}
                {product.seller.verified && (
                  <Check className="w-3 h-3 inline text-primary ml-1" />
                )}
              </p>
              <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <RatingStars rating={product.rating} size="sm" />
                <span className="text-sm text-muted-foreground">({product.reviewCount} ulasan)</span>
                <span className="text-sm text-muted-foreground">| {product.sold} terjual</span>
              </div>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">{formatCurrency(product.price)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                    {product.discount && (
                      <Badge variant="destructive">-{product.discount}%</Badge>
                    )}
                  </>
                )}
              </div>
            </Card>

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Jumlah</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 border border-border rounded flex items-center justify-center text-lg hover:bg-muted"
                >
                  −
                </button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 border border-border rounded flex items-center justify-center text-lg hover:bg-muted"
                >
                  +
                </button>
                <span className="text-sm text-muted-foreground">
                  Stok: {product.stock}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground py-3 border-y border-border">
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4" />
                Pengiriman {product.deliveryDays} hari
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Garansi 100%
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                Pengembalian mudah
              </div>
            </div>

            <p className="text-sm text-foreground">{product.description}</p>

            {product.specs && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Spesifikasi</h3>
                <div className="space-y-1">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex text-sm">
                      <span className="text-muted-foreground w-40">{key}</span>
                      <span className="text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                size="lg"
                variant={addedToCart ? 'secondary' : 'primary'}
                icon={addedToCart ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                onClick={handleAddToCart}
                fullWidth
              >
                {addedToCart ? 'Ditambahkan!' : 'Tambah ke Keranjang'}
              </Button>
              <Button size="lg" variant="outline" onClick={toggleWishlist}>
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist(product.id) ? 'fill-destructive text-destructive' : ''
                  }`}
                />
              </Button>
            </div>
            <Button size="lg" variant="secondary" onClick={handleBuyNow} fullWidth>
              Beli Langsung
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
