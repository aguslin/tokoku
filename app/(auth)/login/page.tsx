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
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(true);
  const loginSuccess = useAuthStore((s) => s.loginSuccess);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const log = (msg: string) => {
    console.log('[LOGIN-DEBUG]', msg);
    setDebugLog((prev) => [...prev, `[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${msg}`]);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    setDebugLog([]);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/_/backend/api/v1';
      const fullUrl = `${apiUrl}/auth/login`;
      log(`POST ${fullUrl}`);
      log(`Body: ${JSON.stringify({ email: data.email, password: '***' })}`);

      let res;
      try {
        res = await fetch(fullUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (fetchErr: any) {
        log(`FETCH ERROR: ${fetchErr.message}`);
        throw new Error(`Gagal terhubung ke server: ${fetchErr.message}`);
      }

      log(`Response status: ${res.status} ${res.statusText}`);
      log(`Response headers: content-type=${res.headers.get('content-type')}`);

      // Read raw text first for debugging
      const rawText = await res.text().catch(() => '');
      log(`Raw response (${rawText.length} chars): ${rawText.slice(0, 500)}`);

      let json;
      try {
        json = JSON.parse(rawText);
      } catch {
        log(`JSON parse failed. Raw text shown above.`);
        throw new Error(`Server returned non-JSON (${res.status}): ${rawText.slice(0, 200)}`);
      }

      log(`Parsed JSON keys: ${Object.keys(json).join(', ')}`);
      if (json.debug) log(`Debug info: ${JSON.stringify(json.debug)}`);

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
        if (json.debug) {
          setError((prev) => `${prev} [Debug: ${JSON.stringify(json.debug)}]`);
        }
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
            <span className="whitespace-pre-wrap break-words">{error}</span>
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

        {/* Debug log panel */}
        {debugLog.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs text-muted-foreground hover:underline w-full text-left mb-1"
            >
              {showDebug ? 'Hide' : 'Show'} Debug Log ({debugLog.length} entries)
            </button>
            {showDebug && (
              <div className="bg-gray-950 text-green-400 text-xs font-mono p-3 rounded-lg overflow-auto max-h-60 whitespace-pre-wrap break-all">
                {debugLog.map((entry, i) => (
                  <div key={i}>{entry}</div>
                ))}
              </div>
            )}
          </div>
        )}

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
