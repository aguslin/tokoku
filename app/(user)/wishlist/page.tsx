'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { formatCurrency } from '@/lib/utils/currency';
import { useWishlistStore } from '@/lib/store';

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();

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
            <h1 className="text-2xl font-bold text-foreground">Wishlist</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg text-muted-foreground mb-6">Wishlist Anda kosong</p>
            <Link href="/marketplace">
              <Button>Jelajahi Produk</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
            {items.map((item) => (
              <Card key={item.productId} hoverable className="overflow-hidden flex flex-col relative">
                <Link href={`/marketplace/${item.slug || item.productId}`}>
                  <div className="relative h-28 sm:h-48 bg-muted mb-2 sm:mb-4 -mx-4 -mt-4 -mb-4">
                    <div className="absolute inset-0">
                      <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="absolute top-2 left-2 p-2 bg-white rounded-full hover:bg-primary/10 transition-colors z-10"
                >
                  <Heart className="w-4 h-4 fill-destructive text-destructive" />
                </button>

                <Link href={`/marketplace/${item.slug || item.productId}`} className="flex-1">
                  <div className="space-y-1 sm:space-y-2">
                    {item.sellerName && (
                      <p className="text-xs text-muted-foreground">{item.sellerName}</p>
                    )}
                    <h3 className="font-semibold text-foreground line-clamp-2 text-xs sm:text-sm">{item.productName}</h3>
                  </div>

                  <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2">
                    <div className="flex items-baseline gap-1 sm:gap-2">
                      <span className="text-sm sm:text-lg font-bold text-primary">{formatCurrency(item.price)}</span>
                      {item.comparePrice && item.comparePrice > 0 && (
                        <span className="text-[10px] sm:text-sm text-muted-foreground line-through">
                          {formatCurrency(item.comparePrice)}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {item.sold > 0 && `${item.sold} terjual`}
                    </p>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
