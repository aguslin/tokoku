'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Zap, Truck, Shield, Sparkles, ArrowRight, Heart } from 'lucide-react';
import { Card } from '@/components/shared/card';
import { Badge } from '@/components/shared/badge';
import { RatingStars } from '@/components/shared/rating-stars';
import { translations } from '@/lib/i18n/id';
import { formatCurrency } from '@/lib/utils/currency';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_TESTIMONIALS } from '@/lib/mock-data/products';
import { useAuthStore } from '@/lib/store';

const btnPrimary = 'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-200 px-4 py-2.5 text-sm h-10 bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80';
const btnOutline = 'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-200 px-4 py-2.5 text-sm h-10 border border-input bg-background text-foreground hover:bg-muted active:bg-muted/80';
const btnPrimaryLg = 'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-200 px-6 py-3 text-base h-12 bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80';
const btnOutlineLg = 'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-200 px-6 py-3 text-base h-12 border border-input bg-background text-foreground hover:bg-muted active:bg-muted/80';

export default function PreLoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/marketplace');
    }
  }, [isAuthenticated, router]);

  return (
    <main className="min-h-screen bg-background">
      {/* Sticky Header with Auth Buttons */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">Shop</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/login" className={btnOutline}>
              {translations.auth.login}
            </Link>
            <Link href="/register" className={btnPrimary}>
              {translations.auth.register}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <Badge variant="info" size="lg" className="w-fit">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {translations.preLogin.welcome}
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
                  {translations.preLogin.tagline}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-lg text-pretty">
                {translations.preLogin.description}
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/register" className={btnPrimaryLg}>
                  <ShoppingCart className="w-5 h-5" />
                  {translations.preLogin.registerButton}
                </Link>
                <Link href="/login" className={btnOutlineLg}>
                  <ArrowRight className="w-5 h-5" />
                  {translations.preLogin.loginButton}
                </Link>
              </div>
            </div>
            <div className="relative h-96 hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl" />
              <Image
                src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=400&fit=crop"
                alt="Belanja"
                fill
                className="object-cover rounded-xl"
                priority
              />
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 lg:grid-cols-3 gap-4 mt-12">
            {[
              { icon: Truck, title: 'Pengiriman Cepat', desc: '2-3 hari pengiriman' },
              { icon: Shield, title: 'Pembayaran Aman', desc: 'Berbagai metode' },
              { icon: Zap, title: 'Penawaran Bagus', desc: 'Flash sale setiap hari' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 lg:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">Belanja Berdasarkan Kategori</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {MOCK_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer text-center"
              >
                <div className="text-4xl mb-2">{cat.icon}</div>
                <p className="font-medium text-foreground text-sm">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale */}
      <section className="py-12 lg:py-16 border-b border-border bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Badge variant="destructive" className="mb-2">
                <Zap className="w-3 h-3 mr-1" />
                Flash Sale
              </Badge>
              <h2 className="text-3xl font-bold text-foreground">Penawaran Terbatas</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Berakhir dalam</p>
              <p className="text-2xl font-bold text-destructive">02:45:30</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_PRODUCTS.filter(p => p.badge === 'flash-sale').map((product) => (
              <Card key={product.id} hoverable className="overflow-hidden flex flex-col">
                <div className="relative h-48 bg-muted mb-4 -mx-4 -mt-4 -mb-4">
                  <div className="absolute inset-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {product.discount && (
                    <Badge variant="destructive" className="absolute top-2 right-2">
                      -{product.discount}%
                    </Badge>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground line-clamp-2 text-sm">{product.name}</h3>
                  <RatingStars rating={product.rating} size="sm" />
                  <p className="text-xs text-muted-foreground">{product.reviewCount} ulasan</p>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-primary">{formatCurrency(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{product.sold} terjual</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 lg:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">Produk Unggulan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_PRODUCTS.map((product) => (
              <Card key={product.id} hoverable className="overflow-hidden flex flex-col">
                <div className="relative h-48 bg-muted mb-4 -mx-4 -mt-4 -mb-4">
                  <div className="absolute inset-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {product.badge && (
                    <Badge
                      variant={
                        product.badge === 'flash-sale'
                          ? 'destructive'
                          : product.badge === 'trending'
                          ? 'warning'
                          : 'info'
                      }
                      className="absolute top-2 right-2"
                    >
                      {product.badge === 'flash-sale'
                        ? 'Flash Sale'
                        : product.badge === 'trending'
                        ? 'Trending'
                        : 'Baru'}
                    </Badge>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <p className="text-xs text-muted-foreground">{product.seller.name}</p>
                  <h3 className="font-semibold text-foreground line-clamp-2 text-sm">{product.name}</h3>
                  <RatingStars rating={product.rating} size="sm" />
                  <p className="text-xs text-muted-foreground">{product.reviewCount} ulasan</p>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-primary">{formatCurrency(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{product.sold} terjual</p>
                  <p className="text-xs text-success">Pengiriman dalam {product.deliveryDays} hari</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 lg:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">Apa Kata Pelanggan Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_TESTIMONIALS.map((testimonial) => (
              <Card key={testimonial.id}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <RatingStars rating={testimonial.rating} size="sm" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{testimonial.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-20 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Siap untuk Berbelanja?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Daftarkan akun Anda sekarang dan nikmati pengalaman belanja yang luar biasa dengan ribuan produk pilihan
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className={btnPrimaryLg}>
              Daftar Sekarang
            </Link>
            <Link href="/login" className={btnOutlineLg}>
              Sudah Punya Akun? Masuk
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Shop Indonesia</h3>
              <p className="text-sm text-white/70">Tempat belanja online terpercaya dengan jutaan produk pilihan.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/" className="hover:text-white">Tentang Kami</Link></li>
                <li><Link href="/" className="hover:text-white">Karir</Link></li>
                <li><Link href="/" className="hover:text-white">Kebijakan Privasi</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Layanan</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/" className="hover:text-white">Hubungi Kami</Link></li>
                <li><Link href="/" className="hover:text-white">Bantuan</Link></li>
                <li><Link href="/" className="hover:text-white">Syarat & Ketentuan</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ikuti Kami</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/" className="hover:text-white">Facebook</Link></li>
                <li><Link href="/" className="hover:text-white">Instagram</Link></li>
                <li><Link href="/" className="hover:text-white">Twitter</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-sm text-white/70">
            <p>© 2024 Shop Indonesia. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

