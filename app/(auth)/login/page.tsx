'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { FormField } from '@/components/shared/form-field';
import { loginSchema } from '@/lib/schemas/auth';
import { translations } from '@/lib/i18n/id';
import { useAuthStore } from '@/lib/store';
import { setAdminToken } from '@/lib/api/admin';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loginSuccess = useAuthStore((s) => s.loginSuccess);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/_/backend/api/v1';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      let json;
      try {
        json = await res.json();
      } catch {
        const text = await res.text().catch(() => '');
        throw new Error(`Server error (${res.status}): ${text.slice(0, 100)}`);
      }
      if (json.success && json.data) {
        loginSuccess(json.data);
        const token = json.data.tokens.accessToken;
        const role = (() => {
          try { return JSON.parse(atob(token.split('.')[1])).role; }
          catch { return 'user'; }
        })();
        if (role === 'admin') {
          setAdminToken(token);
        }
        router.push(role === 'admin' ? '/dashboard' : '/marketplace');
      } else {
        setError(json.message || 'Email atau password salah.');
      }
    } catch (e: any) {
      setError(e?.message || 'Gagal terhubung ke server. Periksa koneksi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{translations.auth.login}</h1>
          <p className="text-muted-foreground">Masuk ke akun Anda</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label={translations.auth.email}
            placeholder="nama@email.com"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
          />

          <FormField
            label={translations.auth.password}
            type="password"
            placeholder="Masukkan kata sandi"
            {...form.register('password')}
            error={form.formState.errors.password?.message}
          />

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Lupa Kata Sandi?
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
            icon={isLoading ? undefined : <LogIn className="w-4 h-4" />}
          >
            {isLoading ? 'Memproses...' : translations.auth.login}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-muted-foreground">atau</span>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {translations.auth.dontHaveAccount}{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            {translations.auth.register}
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href="/" className="text-primary hover:underline">
            Kembali ke Beranda
          </Link>
        </p>
      </Card>
    </main>
  );
}
