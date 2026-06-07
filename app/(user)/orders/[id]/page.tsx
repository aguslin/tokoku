'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, Upload, Banknote, ImagePlus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { Badge } from '@/components/shared/badge';
import { formatCurrency } from '@/lib/utils/currency';
import { useOrderStore } from '@/lib/store';
import { paymentApi } from '@/lib/api/payment';

const STATUS_MAP: Record<string, { label: string; icon: any; variant: 'info' | 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  pending: { label: 'Menunggu Pembayaran', icon: Clock, variant: 'warning' },
  paid: { label: 'Menunggu Konfirmasi', icon: Clock, variant: 'info' },
  confirmed: { label: 'Dikonfirmasi', icon: CheckCircle, variant: 'info' },
  processing: { label: 'Diproses', icon: Package, variant: 'info' },
  packed: { label: 'Dikemas', icon: Package, variant: 'info' },
  shipped: { label: 'Dikirim', icon: Truck, variant: 'info' },
  delivered: { label: 'Terkirim', icon: CheckCircle, variant: 'success' },
  completed: { label: 'Selesai', icon: CheckCircle, variant: 'success' },
  cancelled: { label: 'Dibatalkan', icon: Clock, variant: 'destructive' },
  refunded: { label: 'Dikembalikan', icon: Clock, variant: 'destructive' },
};

const BANK_ACCOUNTS = [
  { bank: 'BCA', account: '1234567890', name: 'PT Marketplace Digital' },
  { bank: 'Mandiri', account: '9876543210', name: 'PT Marketplace Digital' },
  { bank: 'BNI', account: '5556667770', name: 'PT Marketplace Digital' },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getOrder, submitPaymentProof, updateStatus } = useOrderStore();
  const order = getOrder(params.id as string);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUploadProof = async () => {
    if (!selectedFile || !preview) return;
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await paymentApi.submitPaymentProof(order.id, formData);
      const proofUrl = res?.data?.metadata?.proofUrl || preview;
      submitPaymentProof(order.id, proofUrl);
      setSelectedFile(null);
      setPreview(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Gagal mengupload bukti pembayaran';
      setUploadError(message);
      submitPaymentProof(order.id, preview);
      setSelectedFile(null);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

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
            <p className="text-sm text-muted-foreground">Pesanan #{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </Card>

        {order.status === 'pending' && (
          <Card className="border-warning/30 bg-warning/[0.02]">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-warning" />
              Instruksi Pembayaran
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Lakukan transfer ke salah satu rekening di bawah ini, lalu upload bukti pembayaran.
            </p>
            <div className="space-y-3 mb-6">
              {BANK_ACCOUNTS.map((acc) => (
                <div key={acc.bank} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                  <div>
                    <p className="font-semibold text-foreground">{acc.bank}</p>
                    <p className="text-sm text-muted-foreground">a.n {acc.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-lg text-foreground">{acc.account}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20 mb-6">
              <span className="font-semibold text-foreground">Total yang harus dibayar</span>
              <span className="font-bold text-xl text-primary">{formatCurrency(order.total)}</span>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <ImagePlus className="w-4 h-4" />
                Upload Bukti Pembayaran
              </h4>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />

              {uploadError && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {uploadError}
                </div>
              )}

              {!preview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Klik untuk memilih file bukti pembayaran
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: JPG, PNG maks. 5MB
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                    <Image src={preview} alt="Bukti pembayaran" fill className="object-contain" />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => { setSelectedFile(null); setPreview(null); }}>
                      Ganti File
                    </Button>
                    <Button
                      variant="primary"
                      icon={uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      onClick={handleUploadProof}
                      disabled={uploading}
                    >
                      {uploading ? 'Mengupload...' : 'Kirim Bukti Pembayaran'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {order.status === 'paid' && order.paymentProof && (
          <Card className="border-success/30 bg-success/[0.02]">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Bukti Pembayaran Terkirim
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Bukti pembayaran Anda telah kami terima dan sedang diverifikasi. Kami akan mengkonfirmasi pesanan Anda segera.
            </p>
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted mb-2">
              <Image src={order.paymentProof} alt="Bukti pembayaran" fill className="object-contain" />
            </div>
            {order.paymentProofUploadedAt && (
              <p className="text-xs text-muted-foreground">
                Diupload pada {new Date(order.paymentProofUploadedAt).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            )}
          </Card>
        )}

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
          {order.status === 'shipped' && (
            <Button variant="primary" onClick={async () => {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/_/backend/api/v1';
              let apiSucceeded = false;
              try {
                const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;
                const res = await fetch(`${apiUrl}/orders/${order.id}/confirm-receipt`, {
                  method: 'POST',
                  headers,
                });
                const json = await res.json();
                if (json.success) {
                  updateStatus(order.id, 'completed');
                  apiSucceeded = true;
                }
              } catch {}
              if (!apiSucceeded) {
                updateStatus(order.id, 'completed');
              }
            }}>Konfirmasi Penerimaan</Button>
          )}
        </div>
      </div>
    </main>
  );
}
