'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Search, Filter } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { Badge } from '@/components/shared/badge';
import { RatingStars } from '@/components/shared/rating-stars';
import { formatCurrency } from '@/lib/utils/currency';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mock-data/products';
import { useCartStore, useWishlistStore } from '@/lib/store';

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { addItem } = useCartStore();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();

  const filteredProducts = MOCK_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: any) => {
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      price: product.price,
      quantity: 1,
      sellerName: product.seller.name,
      sellerVerified: product.seller.verified,
    });
  };

  const toggleWishlist = (product: any) => {
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

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button variant="outline" icon={<Filter className="w-4 h-4" />}>
              Filter
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Kategori</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {MOCK_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer text-center"
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <p className="font-medium text-foreground text-xs">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : 'Semua Produk'}
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Tidak ada produk yang ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} hoverable className="overflow-hidden flex flex-col">
                  <Link href={`/marketplace/${product.id}`}>
                    <div className="relative h-48 bg-muted mb-4 -mx-4 -mt-4 -mb-4">
                      <div className="absolute inset-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {product.badge && (
                        <Badge
                          variant={
                            product.badge === 'flash-sale'
                              ? 'destructive'
                              : product.badge === 'trending'
                              ? 'warning'
                              : 'info'
                          }
                          className="absolute top-2 right-2"
                        >
                          {product.badge === 'flash-sale'
                            ? 'Flash Sale'
                            : product.badge === 'trending'
                            ? 'Trending'
                            : 'Baru'}
                        </Badge>
                      )}
                    </div>
                  </Link>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-2 left-2 p-2 bg-white rounded-full hover:bg-primary/10 transition-colors z-10"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isInWishlist(product.id)
                          ? 'fill-destructive text-destructive'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>

                  <Link href={`/marketplace/${product.id}`} className="flex-1">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">{product.seller.name}</p>
                      <h3 className="font-semibold text-foreground line-clamp-2 text-sm">{product.name}</h3>
                      <RatingStars rating={product.rating} size="sm" />
                      <p className="text-xs text-muted-foreground">{product.reviewCount} ulasan</p>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-primary">{formatCurrency(product.price)}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatCurrency(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{product.sold} terjual</p>
                      <p className="text-xs text-success">Pengiriman dalam {product.deliveryDays} hari</p>
                    </div>
                  </Link>

                  <div className="mt-4">
                    <Button size="md" fullWidth icon={<ShoppingCart className="w-4 h-4" />} onClick={() => handleAddToCart(product)}>
                      Tambah ke Keranjang
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
