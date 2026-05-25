'use client';

import { ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { Badge } from '@/components/shared/badge';
import { formatCurrency } from '@/lib/utils/currency';
import { useOrderStore } from '@/lib/store';

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'destructive' | 'secondary' }> = {
  pending: { label: 'Menunggu Pembayaran', variant: 'warning' },
  paid: { label: 'Menunggu Konfirmasi', variant: 'info' },
  confirmed: { label: 'Dikonfirmasi', variant: 'info' },
  processing: { label: 'Diproses', variant: 'info' },
  packed: { label: 'Dikemas', variant: 'info' },
  shipped: { label: 'Dikirim', variant: 'info' },
  delivered: { label: 'Terkirim', variant: 'success' },
  completed: { label: 'Selesai', variant: 'success' },
  cancelled: { label: 'Dibatalkan', variant: 'destructive' },
  refunded: { label: 'Dikembalikan', variant: 'destructive' },
};

export default function OrdersPage() {
  const { orders } = useOrderStore();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Pesanan Saya</h1>

        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Belum ada pesanan</p>
            <Link href="/marketplace">
              <Button>Mulai Belanja</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
              return (
                <Card key={order.id} className="p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">#{order.id.slice(0, 8).toUpperCase()}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-muted-foreground">{order.items.length} produk</p>
                    </div>

                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>

                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{formatCurrency(order.total)}</p>
                      <Link href={`/orders/${order.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<ArrowRight className="w-4 h-4" />}
                        >
                          Detail
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
