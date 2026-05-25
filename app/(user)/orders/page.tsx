'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
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

const FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'pending', label: 'Belum Bayar' },
  { key: 'packed', label: 'Dikemas' },
  { key: 'shipped', label: 'Dikirim' },
  { key: 'completed', label: 'Selesai' },
  { key: 'refunded', label: 'Pengembalian' },
  { key: 'cancelled', label: 'Dibatalkan' },
];

function matchFilter(order: any, filter: string): boolean {
  if (filter === 'all') return true;
  if (filter === 'completed') return ['delivered', 'completed'].includes(order.status);
  return order.status === filter;
}

export default function OrdersPage() {
  const { orders } = useOrderStore();
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredOrders = orders.filter(o => matchFilter(o, activeFilter));

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-4">Pesanan Saya</h1>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
                activeFilter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <Card className="text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {activeFilter === 'all' ? 'Belum ada pesanan' : 'Tidak ada pesanan dengan status ini'}
            </p>
            <Link href="/marketplace">
              <Button>Mulai Belanja</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
              return (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <Card className="p-0 overflow-hidden hover:ring-1 hover:ring-primary/20 transition-all">
                    <div className="flex">
                      <div className="relative w-[18%] min-w-[72px] aspect-square bg-muted flex-shrink-0">
                        <Image
                          src={order.items[0]?.productImage || '/placeholder.svg'}
                          alt={order.items[0]?.productName || 'Produk'}
                          fill
                          className="object-cover"
                        />
                        {order.items.length > 1 && (
                          <div className="absolute bottom-1 right-1 bg-background/80 text-[10px] font-medium px-1.5 py-0.5 rounded">
                            +{order.items.length - 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-3 sm:p-4 min-w-0">
                        <span className={`block text-[10px] sm:text-xs font-medium mb-0.5 ${
                          statusInfo.variant === 'warning' ? 'text-warning' :
                          statusInfo.variant === 'info' ? 'text-info' :
                          statusInfo.variant === 'success' ? 'text-success' :
                          statusInfo.variant === 'destructive' ? 'text-destructive' :
                          'text-muted-foreground'
                        }`}>
                          {statusInfo.label}
                        </span>
                        <h3 className="font-semibold text-foreground text-xs sm:text-sm line-clamp-2 mb-0.5">
                          {order.items[0]?.productName || 'Produk'}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">
                          {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                          x{order.items.length}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground text-right">
                          Total {order.items.length} Produk: <span className="font-bold text-primary">{formatCurrency(order.total)}</span>
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
