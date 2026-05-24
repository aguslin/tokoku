'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { Badge } from '@/components/shared/badge';
import { formatCurrency } from '@/lib/utils/currency';
import { useOrderStore } from '@/lib/store';

const STATUS_MAP: Record<string, { label: string; icon: any; variant: 'info' | 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  pending: { label: 'Menunggu Pembayaran', icon: Clock, variant: 'warning' },
  paid: { label: 'Dibayar', icon: CheckCircle, variant: 'info' },
  processing: { label: 'Diproses', icon: Package, variant: 'info' },
  packed: { label: 'Dikemas', icon: Package, variant: 'info' },
  shipped: { label: 'Dikirim', icon: Truck, variant: 'info' },
  delivered: { label: 'Terkirim', icon: CheckCircle, variant: 'success' },
  completed: { label: 'Selesai', icon: CheckCircle, variant: 'success' },
  cancelled: { label: 'Dibatalkan', icon: Clock, variant: 'destructive' },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getOrder } = useOrderStore();
  const order = getOrder(params.id as string);

  if (!order) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Pesanan tidak ditemukan</p>
          <Link href="/orders">
            <Button>Kembali ke Pesanan</Button>
          </Link>
        </div>
      </main>
    );
  }

  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/orders">
              <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />} size="sm">
                Kembali
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Detail Pesanan</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${statusInfo.variant === 'success' ? 'bg-success/10' : statusInfo.variant === 'warning' ? 'bg-warning/10' : 'bg-info/10'}`}>
            <StatusIcon className={`w-6 h-6 ${statusInfo.variant === 'success' ? 'text-success' : statusInfo.variant === 'warning' ? 'text-warning' : 'text-info'}`} />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{statusInfo.label}</p>
            <p className="text-sm text-muted-foreground">ID Pesanan: {order.id}</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-foreground mb-4">Produk</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.productId} className="flex gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">{item.quantity} x {formatCurrency(item.price)}</p>
                </div>
                <p className="font-bold text-primary">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-foreground mb-4">Informasi Pengiriman</h3>
          <div className="flex gap-2 mb-3">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-foreground">{order.address}</p>
              <p className="text-sm text-muted-foreground">Kurir: {order.courier}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Estimasi tiba: {new Date(order.estimatedDelivery).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="font-bold text-foreground mb-4">Rincian Pembayaran</h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ongkos Kirim</span>
            <span>{formatCurrency(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pajak</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(order.total)}</span>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/orders')}>
            Kembali
          </Button>
          {order.status === 'delivered' && (
            <Button variant="primary">Konfirmasi Penerimaan</Button>
          )}
        </div>
      </div>
    </main>
  );
}
