'use client';

import Link from 'next/link';
import { ShoppingCart, ArrowLeft, LayoutDashboard, ShoppingBag, Users, Package } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border hidden lg:flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">Shop</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/dashboard?tab=orders"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Orders
          </Link>
          <Link
            href="/dashboard?tab=users"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <Users className="w-4 h-4" />
            Users
          </Link>
          <Link
            href="/dashboard?tab=products"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <Package className="w-4 h-4" />
            Products
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Toko
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-border p-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-foreground">Shop Admin</span>
        </Link>
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
          Kembali
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pt-0 pt-14">
        {children}
      </div>
    </div>
  );
}
