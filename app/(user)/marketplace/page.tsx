'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Search, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { Badge } from '@/components/shared/badge';
import { RatingStars } from '@/components/shared/rating-stars';
import { formatCurrency } from '@/lib/utils/currency';
import { useCartStore, useWishlistStore } from '@/lib/store';

function getImageUrl(product: any): string {
  if (product.ProductImages?.length > 0) {
    const primary = product.ProductImages.find((i: any) => i.isPrimary) || product.ProductImages[0];
    return primary.url.startsWith('http') ? primary.url : primary.url;
  }
  return '/placeholder.svg';
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCartStore();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/_/backend/api/v1';
        const res = await fetch(`${apiUrl}/products?limit=50`);
        const json = await res.json();
        if (json.success && json.data?.products) {
          setProducts(Array.isArray(json.data.products) ? json.data.products : []);
        } else {
          setProducts([]);
        }
      } catch (e) {
        console.error('Failed to fetch products', e);
        setError('Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    if (!p?.name) return false;
    return p.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAddToCart = (product: any) => {
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productImage: getImageUrl(product),
      price: Number(product.price),
      quantity: 1,
      sellerName: product.seller?.name || 'Toko',
      sellerVerified: true,
    });
  };

  const toggleWishlist = (product: any) => {
    if (isInWishlist(product.id)) {
      removeWishlist(product.id);
    } else {
      addWishlist({
        productId: product.id,
        productName: product.name,
        productImage: getImageUrl(product),
        price: Number(product.price),
        slug: product.slug,
        sellerName: product.seller?.name,
        stock: product.stock,
        comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
        sold: product.sold,
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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
            {searchQuery && (
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  Hasil Pencarian: &quot;{searchQuery}&quot;
                </h2>
              </div>
            )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Tidak ada produk yang ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} hoverable className="overflow-hidden flex flex-col relative">
                  <Link href={`/marketplace/${product.slug || product.id}`}>
                    <div className="relative h-28 sm:h-48 bg-muted mb-2 sm:mb-4 -mx-4 -mt-4 -mb-4">
                      <div className="absolute inset-0">
                        <Image
                          src={getImageUrl(product)}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
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

                  <Link href={`/marketplace/${product.slug || product.id}`} className="flex-1">
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-xs text-muted-foreground">{product.seller?.name || 'Toko'}</p>
                      <h3 className="font-semibold text-foreground line-clamp-2 text-xs sm:text-sm">{product.name}</h3>
                    </div>

                    <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2">
                      <div className="flex items-baseline gap-1 sm:gap-2">
                        <span className="text-sm sm:text-lg font-bold text-primary">{formatCurrency(Number(product.price))}</span>
                        {product.comparePrice && Number(product.comparePrice) > 0 && (
                          <span className="text-[10px] sm:text-sm text-muted-foreground line-through">
                            {formatCurrency(Number(product.comparePrice))}
                          </span>
                        )}
                      </div>
                      {product.sold > 0 && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {product.sold} terjual
                        </p>
                      )}
                    </div>
                  </Link>

                  <div className="hidden sm:block mt-4">
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
