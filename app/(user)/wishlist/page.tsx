'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { formatCurrency } from '@/lib/utils/currency';
import { useWishlistStore, useCartStore } from '@/lib/store';

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  const moveToCart = (item: any) => {
    addItem({
      id: `${item.productId}-${Date.now()}`,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      price: item.price,
      quantity: 1,
      sellerName: '',
      sellerVerified: false,
    });
    removeItem(item.productId);
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <Card key={item.productId} className="overflow-hidden flex flex-col">
                <div className="relative h-48 bg-muted -mx-4 -mt-4 -mb-4">
                  <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                </div>
                <div className="flex-1 mt-4 space-y-2">
                  <h3 className="font-semibold text-foreground line-clamp-2 text-sm">{item.productName}</h3>
                  <p className="text-lg font-bold text-primary">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" fullWidth icon={<ShoppingCart className="w-4 h-4" />} onClick={() => moveToCart(item)}>
                    Keranjang
                  </Button>
                  <Button size="sm" variant="destructive" icon={<Trash2 className="w-4 h-4" />} onClick={() => removeItem(item.productId)} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
