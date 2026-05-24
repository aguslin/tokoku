'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Calendar, Package, Heart, MapPin, LogOut, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { useAuthStore } from '@/lib/store';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Silakan masuk untuk melihat profil</p>
          <Link href="/login">
            <Button>Masuk</Button>
          </Link>
        </div>
      </main>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/marketplace">
              <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />} size="sm">
                Kembali
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Profil Saya</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.role === 'admin' ? 'Admin' : 'Pembeli'}</p>
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-bold text-foreground">Informasi Akun</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="text-foreground">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Bergabung:</span>
              <span className="text-foreground">
                {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Role:</span>
              <span className="text-foreground capitalize">{user.role}</span>
            </div>
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="font-bold text-foreground">Menu</h3>
          <Link href="/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Package className="w-5 h-5 text-muted-foreground" />
            <span className="text-foreground">Pesanan Saya</span>
          </Link>
          <Link href="/wishlist" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Heart className="w-5 h-5 text-muted-foreground" />
            <span className="text-foreground">Wishlist</span>
          </Link>
          <Link href="/marketplace" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <span className="text-foreground">Alamat Tersimpan</span>
          </Link>
        </Card>

        <Button variant="destructive" fullWidth icon={<LogOut className="w-4 h-4" />} onClick={handleLogout}>
          Keluar
        </Button>
      </div>
    </main>
  );
}
