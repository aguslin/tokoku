'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { FormField } from '@/components/shared/form-field';
import { forgotPasswordSchema } from '@/lib/schemas/auth';

export default function ForgotPasswordPage() {
  const [isSent, setIsSent] = useState(false);

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = () => {
    setIsSent(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Lupa Kata Sandi</h1>
          <p className="text-muted-foreground">
            {isSent
              ? 'Tautan reset kata sandi telah dikirim ke email Anda'
              : 'Masukkan email Anda untuk mereset kata sandi'}
          </p>
        </div>

        {isSent ? (
          <div className="space-y-4">
            <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
              <Mail className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-sm text-foreground">
                Silakan cek email Anda dan ikuti tautan untuk mereset kata sandi.
              </p>
            </div>
            <Link href="/login">
              <Button fullWidth>Kembali ke Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label="Email"
              type="email"
              placeholder="nama@email.com"
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />
            <Button type="submit" fullWidth icon={<KeyRound className="w-4 h-4" />}>
              Kirim Tautan Reset
            </Button>
          </form>
        )}

        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href="/login" className="text-primary hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            Kembali ke Login
          </Link>
        </p>
      </Card>
    </main>
  );
}
