'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { formatCurrency } from '@/lib/utils/currency';
import { useCartStore, useOrderStore } from '@/lib/store';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();

  useEffect(() => {
    if (items.length === 0) {
      return;
    }
    const orderId = addOrder({
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        productImage: i.productImage,
        price: i.price,
        quantity: i.quantity,
      })),
      subtotal: total - 50000,
      shipping: 50000,
      tax: 0,
      total,
      status: 'pending',
      paymentMethod: 'BCA Virtual Account',
      courier: 'JNE REG',
      address: 'Jl. Sudirman No. 123, Jakarta Pusat',
      estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
    });
    clearCart();
    router.replace(`/orders/${orderId}`);
  }, []);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-success/20 rounded-full animate-pulse" />
            <div className="relative p-4 bg-success/10 rounded-full">
              <CheckCircle className="w-16 h-16 text-success" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Pesanan Berhasil!</h1>
          <p className="text-muted-foreground">
            Terima kasih atas pembelian Anda. Pesanan Anda telah berhasil dibuat.
          </p>
        </div>

        <div className="bg-secondary/5 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2 bg-success/10 rounded-lg">
              <Package className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status Pesanan</p>
              <p className="font-semibold text-foreground">Menunggu Pembayaran</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-left">
            <div className="p-2 bg-info/10 rounded-lg">
              <Truck className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimasi Pengiriman</p>
              <p className="font-semibold text-foreground">2-3 Hari Kerja</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Kami telah mengirimkan email konfirmasi dengan detail pesanan dan informasi pelacakan.
        </p>

        <div className="space-y-2 pt-4">
          <Link href="/orders" className="block">
            <Button fullWidth size="lg">
              Lihat Pesanan Saya
            </Button>
          </Link>
          <Link href="/marketplace" className="block">
            <Button fullWidth size="lg" variant="outline" icon={<Home className="w-4 h-4" />}>
              Lanjut Belanja
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
