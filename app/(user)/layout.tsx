'use client';

import Link from 'next/link';
import { ShoppingCart, Store, Package, Heart, User, LogOut } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/lib/store';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Link href="/marketplace" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">Shop</span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/marketplace"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Marketplace</span>
            </Link>
            <Link
              href="/wishlist"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Wishlist</span>
            </Link>
            <Link
              href="/orders"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Pesanan</span>
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors relative"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Keranjang</span>
              {items.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-destructive text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {items.length}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user?.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={() => { logout(); window.location.href = '/'; }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"
              >
                Masuk
              </Link>
            )}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
