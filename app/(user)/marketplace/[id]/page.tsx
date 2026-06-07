'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, ArrowLeft, Check, Truck, Shield, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { Badge } from '@/components/shared/badge';
import { RatingStars } from '@/components/shared/rating-stars';
import { formatCurrency } from '@/lib/utils/currency';
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addItem } = useCartStore();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!params.id) {
          setError('ID produk tidak ditemukan');
          setLoading(false);
          return;
        }
        
        setLoading(true);
        setError('');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/_/backend/api/v1';
        
        const productId = params.id;
        console.log('Fetching product with ID:', productId);
        
        const res = await fetch(`${apiUrl}/products/${productId}`);
        const json = await res.json();
        
        console.log('API Response:', json);
        
        if (json.success && json.data) {
          setProduct(json.data);
        } else {
          setError('Produk tidak ditemukan');
        }
      } catch (err) {
        console.error('Failed to fetch product', err);
        setError('Gagal memuat produk');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </main>
    );
  }

  if (!product || error) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || 'Produk tidak ditemukan'}</p>
          <Link href="/marketplace">
            <Button>Kembali ke Marketplace</Button>
          </Link>
        </div>
      </main>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const imageUrl = product.ProductImages?.length > 0 
      ? (product.ProductImages[0].url.startsWith('http') ? product.ProductImages[0].url : product.ProductImages[0].url)
      : '/placeholder.svg';
    
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productImage: imageUrl,
      price: Number(product.price),
      quantity,
      sellerName: product.seller?.name || 'Toko',
      sellerVerified: product.seller?.verified || false,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const imageUrl = product.ProductImages?.length > 0 
      ? (product.ProductImages[0].url.startsWith('http') ? product.ProductImages[0].url : product.ProductImages[0].url)
      : '/placeholder.svg';
    
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productImage: imageUrl,
      price: Number(product.price),
      quantity,
      sellerName: product.seller?.name || 'Toko',
      sellerVerified: product.seller?.verified || false,
    });
    router.push('/checkout');
  };

  const toggleWishlist = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const imageUrl = product.ProductImages?.length > 0 
      ? (product.ProductImages[0].url.startsWith('http') ? product.ProductImages[0].url : product.ProductImages[0].url)
      : '/placeholder.svg';
    
    if (isInWishlist(product.id)) {
      removeWishlist(product.id);
    } else {
      addWishlist({
        productId: product.id,
        productName: product.name,
        productImage: imageUrl,
        price: Number(product.price),
        slug: product.slug,
        sellerName: product.seller?.name,
        stock: product.stock,
        comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
        sold: product.sold,
      });
    }
  };

  const images = product.ProductImages?.length > 0 
    ? product.ProductImages.map((img: any) => img.url)
    : ['/placeholder.svg'];

  const mainImage = images[selectedImage] || images[0];

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
            <h1 className="text-xl font-bold text-foreground">Detail Produk</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative h-80 lg:h-96 bg-muted rounded-xl overflow-hidden">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${
                      selectedImage === i ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                <Link href="/marketplace" className="hover:text-primary">{product.Category?.name || 'Kategori'}</Link>
                <span className="mx-2">/</span>
                {product.seller?.name || 'Toko'}
                {product.seller?.verified && (
                  <Check className="w-3 h-3 inline text-primary ml-1" />
                )}
              </p>
              <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-muted-foreground">Stok: {product.stock}</span>
              </div>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">{formatCurrency(Number(product.price))}</span>
                {product.comparePrice && Number(product.comparePrice) > 0 && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatCurrency(Number(product.comparePrice))}
                    </span>
                    {product.comparePrice && product.price && (
                      <Badge variant="destructive">
                        -{Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)}%
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </Card>

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Jumlah</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 border border-border rounded flex items-center justify-center text-lg hover:bg-muted"
                >
                  −
                </button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(Number(product.stock), quantity + 1))}
                  className="w-8 h-8 border border-border rounded flex items-center justify-center text-lg hover:bg-muted"
                >
                  +
                </button>
                <span className="text-sm text-muted-foreground">
                  Stok: {product.stock}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground py-3 border-y border-border">
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4" />
                Pengiriman 2-3 hari
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Garansi 100%
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                Pengembalian mudah
              </div>
            </div>

            {product.description && (
              <p className="text-sm text-foreground">{product.description}</p>
            )}

            <div className="flex gap-3">
              <Button
                size="lg"
                variant={addedToCart ? 'secondary' : 'primary'}
                icon={addedToCart ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                onClick={handleAddToCart}
                fullWidth
              >
                {addedToCart ? 'Ditambahkan!' : 'Tambah ke Keranjang'}
              </Button>
              <Button size="lg" variant="outline" onClick={toggleWishlist}>
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist(product.id) ? 'fill-destructive text-destructive' : ''
                  }`}
                />
              </Button>
            </div>
            <Button size="lg" variant="secondary" onClick={handleBuyNow} fullWidth>
              Beli Langsung
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
