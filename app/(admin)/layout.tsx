'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingCart, ArrowLeft, LayoutDashboard, ShoppingBag, Users,
  Package, FolderTree, Ticket, Key, CheckCircle, XCircle
} from 'lucide-react';
import { Toaster } from 'sonner';
import { getAdminToken, setAdminToken, clearAdminToken } from '@/lib/api/admin';
import type { ToasterProps } from 'sonner';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard?tab=orders', label: 'Pesanan', icon: ShoppingBag },
  { href: '/dashboard?tab=products', label: 'Produk', icon: Package },
  { href: '/dashboard?tab=categories', label: 'Kategori', icon: FolderTree },
  { href: '/dashboard?tab=users', label: 'Pengguna', icon: Users },
  { href: '/dashboard?tab=vouchers', label: 'Voucher', icon: Ticket },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!getAdminToken());
  }, []);

  const handleSetToken = () => {
    if (tokenInput.trim()) {
      setAdminToken(tokenInput.trim());
      setHasToken(true);
      setShowTokenInput(false);
      setTokenInput('');
    }
  };

  const handleClearToken = () => {
    clearAdminToken();
    setHasToken(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
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

        <div className="px-4 pt-3 pb-1">
          <button onClick={() => setShowTokenInput(!showTokenInput)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors w-full">
            <Key className="w-3 h-3" />
            {hasToken ? 'API Token (set)' : 'API Token (not set)'}
            {hasToken ? <CheckCircle className="w-3 h-3 text-success" /> : <XCircle className="w-3 h-3 text-destructive" />}
          </button>
          {showTokenInput && (
            <div className="mt-2 flex gap-1">
              <input type="text" placeholder="Paste Bearer token..."
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-input rounded focus:outline-none focus:ring-1 focus:ring-primary" />
              <button onClick={handleSetToken}
                className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90">
                Set
              </button>
              {hasToken && (
                <button onClick={handleClearToken}
                  className="px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90">
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                }`}>
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Toko
          </Link>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-border px-3 py-2.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-foreground">Shop Admin</span>
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowTokenInput(!showTokenInput)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors">
            <Key className="w-4 h-4" />
          </button>
          <Link href="/"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Mobile bottom tab navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border flex justify-around items-center px-1 py-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-0 flex-1 ${
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-primary'
              }`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] leading-tight whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex-1 lg:pt-0 pt-[49px] pb-[65px]">
        {children}
      </div>
      <Toaster richColors closeButton position="top-right" />
    </div>
  );
}
