'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { FormField } from '@/components/shared/form-field';
import { registerSchema } from '@/lib/schemas/auth';
import { translations } from '@/lib/i18n/id';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = form.watch('password');

  const checkPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    setPasswordStrength(strength);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });
      const json = await res.json();
      if (json.success) {
        router.push('/login');
      } else {
        setError(json.message || 'Registrasi gagal. Silakan coba lagi.');
      }
    } catch (e: any) {
      setError(e?.message || 'Gagal terhubung ke server. Periksa koneksi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{translations.auth.register}</h1>
          <p className="text-muted-foreground">Buat akun baru untuk mulai berbelanja</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label={translations.auth.fullName}
            placeholder="Masukkan nama lengkap"
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />

          <FormField
            label={translations.auth.email}
            type="email"
            placeholder="nama@email.com"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">{translations.auth.password}</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-primary hover:underline"
              >
                {showPassword ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                {...form.register('password', {
                  onChange: (e) => checkPasswordStrength(e.target.value),
                })}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i < passwordStrength ? 'bg-success' : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {passwordStrength === 0 && 'Kata sandi terlalu lemah'}
                  {passwordStrength === 1 && 'Kata sandi lemah'}
                  {passwordStrength === 2 && 'Kata sandi sedang'}
                  {passwordStrength === 3 && 'Kata sandi kuat'}
                  {passwordStrength === 4 && 'Kata sandi sangat kuat'}
                </p>
              </div>
            )}
            {form.formState.errors.password && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>

          <FormField
            label={translations.auth.confirmPassword}
            type="password"
            placeholder="Ketik ulang kata sandi"
            {...form.register('confirmPassword')}
            error={form.formState.errors.confirmPassword?.message}
          />

          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
            icon={isLoading ? undefined : <UserPlus className="w-4 h-4" />}
          >
            {isLoading ? 'Memproses...' : translations.auth.register}
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
          {translations.auth.alreadyHaveAccount}{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            {translations.auth.login}
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
