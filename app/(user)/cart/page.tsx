'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { formatCurrency } from '@/lib/utils/currency';
import { useCartStore } from '@/lib/store';

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 500000 ? 0 : 50000;
  const total = subtotal + shipping;

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
            <h1 className="text-2xl font-bold text-foreground">Keranjang Belanja</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg text-muted-foreground mb-6">Keranjang Anda kosong</p>
            <Link href="/marketplace">
              <Button>Lanjut Belanja</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="flex gap-4">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 py-2">
                    <Link href={`/marketplace/${item.productId}`}>
                      <h3 className="font-semibold text-foreground hover:text-primary">{item.productName}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-2">{item.sellerName}</p>
                    <p className="text-lg font-bold text-primary mb-4">{formatCurrency(item.price)}</p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 border border-border rounded flex items-center justify-center text-sm hover:bg-muted"
                        >
                          −
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 border border-border rounded flex items-center justify-center text-sm hover:bg-muted"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div>
              <Card className="space-y-4 sticky top-20">
                <h2 className="font-bold text-foreground text-lg">Ringkasan Pesanan</h2>

                <div className="space-y-2 border-b border-border pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({items.length} produk)</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pengiriman</span>
                    <span>{shipping === 0 ? <span className="text-success">Gratis</span> : formatCurrency(shipping)}</span>
                  </div>
                  {subtotal >= 500000 && (
                    <p className="text-xs text-success">Selamat! Anda mendapat gratis ongkir</p>
                  )}
                </div>

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>

                <Link href="/checkout" className="block">
                  <Button fullWidth size="lg" icon={<ShoppingCart className="w-4 h-4" />}>
                    Lanjut ke Checkout
                  </Button>
                </Link>

                <Link href="/marketplace" className="block">
                  <Button variant="outline" fullWidth>
                    Lanjut Belanja
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
