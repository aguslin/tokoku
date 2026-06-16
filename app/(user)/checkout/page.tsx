'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Truck, MapPin, Banknote, AlertCircle, Zap, Package, Loader2, Warehouse } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { formatCurrency } from '@/lib/utils/currency';
import { MOCK_ADDRESSES } from '@/lib/mock-data/addresses';
import { useCartStore, useOrderStore } from '@/lib/store';
import { paymentApi } from '@/lib/api/payment';

interface ShipOption {
  courierServiceId: string;
  courier: string;
  service: string;
  code: string; // 'reguler' | 'instant'
  tier: 'reguler' | 'instant';
  eta: string | null;
  cost: number;
}
interface ShipQuote {
  origin: { warehouseId: string; name: string; city: string; province: string; distanceKm: number | null; fulfills: boolean } | null;
  options: ShipOption[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total: cartTotal, clearCart } = useCartStore();
  const { addOrder, updateStatus: updateOrderStatus } = useOrderStore();
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(MOCK_ADDRESSES[0].id);
  const [selectedPayment, setSelectedPayment] = useState('bca-va');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [quote, setQuote] = useState<ShipQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const address = MOCK_ADDRESSES.find(a => a.id === selectedAddress) || MOCK_ADDRESSES[0];

  // Fetch a live shipping quote (nearest warehouse + Reguler/Instan options) whenever
  // the destination address or cart changes.
  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    setLoadingQuote(true);
    fetch(`${API_BASE}/shipping/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: address.city,
        province: address.province,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      }),
    })
      .then(r => r.json())
      .then(json => {
        if (cancelled) return;
        const q: ShipQuote = json.data || { origin: null, options: [] };
        setQuote(q);
        // Default to the cheapest reguler option.
        const cheapest = [...q.options].sort((a, b) => a.cost - b.cost)[0];
        setSelectedServiceId(prev => prev && q.options.some(o => o.courierServiceId === prev) ? prev : cheapest?.courierServiceId || null);
      })
      .catch(() => { if (!cancelled) setQuote({ origin: null, options: [] }); })
      .finally(() => { if (!cancelled) setLoadingQuote(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddress, items.length]);

  const subtotal = cartTotal;
  const selectedOption = quote?.options.find(o => o.courierServiceId === selectedServiceId) || null;
  const shipping = selectedOption?.cost || 0;
  const total = subtotal + shipping;

  const paymentMethods = [
    { id: 'bca-va', name: 'BCA Virtual Account', icon: '🏦' },
    { id: 'mandiri-va', name: 'Mandiri Virtual Account', icon: '🏦' },
    { id: 'bni-va', name: 'BNI Virtual Account', icon: '🏦' },
    { id: 'gopay', name: 'GoPay', icon: '📱' },
    { id: 'ovo', name: 'OVO', icon: '📱' },
    { id: 'dana', name: 'DANA', icon: '📱' },
    { id: 'qris', name: 'QRIS', icon: '✨' },
  ];

  const handlePayment = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const addrStr = `${address.street}, ${address.city}, ${address.province} ${address.zipCode}`;
      const courierLabel = selectedOption
        ? `${selectedOption.courier} - ${selectedOption.service}${quote?.origin ? ` (dari ${quote.origin.name})` : ''}`
        : 'Pengiriman';

      const orderData = {
        items: items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          productImage: i.productImage,
          price: i.price,
          quantity: i.quantity,
        })),
        subtotal,
        shipping,
        tax: 0,
        total,
        status: 'pending' as const,
        paymentMethod: paymentMethods.find(p => p.id === selectedPayment)?.name || 'BCA Virtual Account',
        courier: courierLabel,
        address: addrStr,
        estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
      };

      const orderId = addOrder(orderData);

      const paymentMethodId = selectedPayment;
      const res = await paymentApi.createPayment(orderId, paymentMethodId);
      if (res.success) {
        updateOrderStatus(orderId, 'pending');
      }

      clearCart();

      setTimeout(() => {
        router.push(`/orders/${orderId}`);
      }, 1500);
    } catch {
      setPaymentError('Gagal memproses pembayaran. Silakan coba lagi.');
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !isProcessing) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Keranjang Anda kosong</p>
          <Link href="/marketplace">
            <Button>Lanjut Belanja</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/cart">
              <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />} size="sm">
                Kembali
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className={`transition-all ${step >= 1 ? 'border-primary' : ''}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step > 1 ? 'bg-success text-white' : 'bg-primary text-white'}`}>
                  {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
                </div>
                <h3 className="font-bold text-foreground">Alamat Pengiriman</h3>
              </div>

              {step >= 1 && (
                <div className="space-y-3 pl-12">
                  {MOCK_ADDRESSES.map((addr) => (
                    <label key={addr.id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedAddress === addr.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="w-4 h-4 mt-1"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{addr.label}</p>
                          {addr.isDefault && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Utama</span>}
                        </div>
                        <p className="text-sm text-foreground">{addr.name} | {addr.phone}</p>
                        <p className="text-sm text-muted-foreground">{addr.street}, {addr.city}, {addr.province} {addr.zipCode}</p>
                      </div>
                    </label>
                  ))}
                  {step === 1 && (
                    <Button size="sm" onClick={() => setStep(2)} className="w-full">
                      Lanjut ke Pengiriman
                    </Button>
                  )}
                </div>
              )}
            </Card>

            <Card className={`transition-all ${step >= 2 ? 'border-primary' : 'opacity-60'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step > 2 ? 'bg-success text-white' : step >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                  {step > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
                </div>
                <h3 className="font-bold text-foreground">Pilih Pengiriman</h3>
              </div>

              {step >= 2 && (
                <div className="space-y-3 pl-12">
                  {/* Nearest-warehouse banner (UAT #7) */}
                  {quote?.origin && (
                    <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <Warehouse className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div className="text-xs text-foreground">
                        <p className="font-semibold">Dikirim dari gudang terdekat: {quote.origin.name}</p>
                        <p className="text-muted-foreground">
                          {quote.origin.city}, {quote.origin.province}
                          {quote.origin.distanceKm != null && ` · ±${quote.origin.distanceKm} km dari alamat Anda`}
                          {!quote.origin.fulfills && ' · sebagian stok'}
                        </p>
                      </div>
                    </div>
                  )}

                  {loadingQuote && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                      <Loader2 className="w-4 h-4 animate-spin" /> Menghitung ongkir...
                    </div>
                  )}

                  {!loadingQuote && (['reguler', 'instant'] as const).map((tier) => {
                    const tierOptions = (quote?.options || []).filter(o => o.tier === tier);
                    if (!tierOptions.length) return null;
                    return (
                      <div key={tier} className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {tier === 'instant' ? <Zap className="w-3.5 h-3.5 text-warning" /> : <Package className="w-3.5 h-3.5" />}
                          {tier === 'instant' ? 'Instan' : 'Reguler'}
                        </div>
                        {tierOptions.map((o) => (
                          <label key={o.courierServiceId} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedServiceId === o.courierServiceId ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                            <input
                              type="radio"
                              name="courier"
                              checked={selectedServiceId === o.courierServiceId}
                              onChange={() => setSelectedServiceId(o.courierServiceId)}
                              className="w-4 h-4"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{o.courier} <span className="font-normal text-muted-foreground">· {o.service}</span></p>
                              {o.eta && <p className="text-xs text-muted-foreground">Estimasi {o.eta}</p>}
                            </div>
                            <span className="font-semibold text-foreground">{formatCurrency(o.cost)}</span>
                          </label>
                        ))}
                      </div>
                    );
                  })}

                  {!loadingQuote && (quote?.options.length ?? 0) === 0 && (
                    <p className="text-sm text-muted-foreground py-2">Opsi pengiriman tidak tersedia.</p>
                  )}

                  {step === 2 && (
                    <Button size="sm" onClick={() => setStep(3)} className="w-full" disabled={!selectedOption}>
                      Lanjut ke Pembayaran
                    </Button>
                  )}
                </div>
              )}
            </Card>

            <Card className={`transition-all ${step >= 3 ? 'border-primary' : 'opacity-60'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                  {step >= 3 ? <CheckCircle className="w-4 h-4" /> : '3'}
                </div>
                <h3 className="font-bold text-foreground">Metode Pembayaran</h3>
              </div>

              {step >= 3 && (
                <div className="space-y-3 pl-12">
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedPayment === method.id ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={selectedPayment === method.id}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{method.icon} {method.name}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {step === 3 && (
                    <Button
                      size="lg"
                      fullWidth
                      onClick={handlePayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Memproses...' : `Bayar ${formatCurrency(total)}`}
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </div>

          <div>
            <Card className="sticky top-20 space-y-4">
              <h3 className="font-bold text-foreground text-lg">Ringkasan Pesanan</h3>

              <div className="space-y-3">
                {items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted" />
                    <div className="flex-1 text-sm">
                      <p className="text-foreground line-clamp-1">{item.productName}</p>
                      <p className="text-muted-foreground">{item.quantity}x</p>
                    </div>
                    <p className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-xs text-muted-foreground">+{items.length - 3} produk lainnya</p>
                )}
              </div>

              <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({items.length} produk)</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pengiriman</span>
                  <span className="font-semibold">{formatCurrency(shipping)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex justify-between items-center">
                <span className="font-bold text-foreground">Total Pembayaran</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
              </div>

              <div className="bg-info/10 border border-info/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-info" />
                  <p className="text-xs text-foreground font-semibold">Cicilan Tersedia</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Cicilan 0% untuk semua metode pembayaran</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
