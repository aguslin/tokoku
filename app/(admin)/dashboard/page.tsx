'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  LayoutDashboard, Users, ShoppingBag, Package, FolderTree, Ticket,
  Plus, Pencil, Trash2, Eye, Search, AlertCircle, X, Check, ArrowUpDown, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { Modal } from '@/components/shared/modal';
import { adminApi } from '@/lib/api/admin';

type Tab = 'users' | 'categories' | 'products' | 'orders' | 'vouchers';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'users', label: 'Pengguna', icon: Users },
  { id: 'categories', label: 'Kategori', icon: FolderTree },
  { id: 'products', label: 'Produk', icon: Package },
  { id: 'orders', label: 'Pesanan', icon: ShoppingBag },
  { id: 'vouchers', label: 'Voucher', icon: Ticket },
];

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  paid: 'bg-blue-100 text-blue-600',
  processing: 'bg-blue-100 text-blue-600',
  shipped: 'bg-primary/10 text-primary',
  delivered: 'bg-success/10 text-success',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];

function useFetch<T>(fetcher: () => Promise<{ success: boolean; data?: T; error?: string }>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true); setError('');
    const res = await fetcher();
    if (res.success && res.data) {
      setData(Array.isArray(res.data) ? res.data as any : res.data);
    } else {
      setError(res.error || 'Gagal memuat data');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, []);

  return { data, loading, error, refetch: fetch };
}

interface UserData { id: string; name: string; email: string; phone: string; isActive: boolean; createdAt: string; }
interface Category { id: string; name: string; slug: string; description: string; isActive: boolean; sortOrder: number; }
interface Product { id: string; name: string; slug: string; price: number; stock: number; sku: string; isActive: boolean; isFeatured: boolean; categoryId: string; }
interface Order { id: string; orderNumber: string; status: string; total: number; subtotal: number; shippingCost: number; notes: string; createdAt: string; userId: string; }
interface Voucher { id: string; code: string; name: string; type: string; value: number; minOrder: number; maxDiscount: number | null; usageLimit: number | null; usedCount: number; startsAt: string; endsAt: string; isActive: boolean; }

function DashboardContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>('users');
  const [search, setSearch] = useState('');

  const users = useFetch<UserData[]>(() => adminApi.get('/users'));
  const categories = useFetch<Category[]>(() => adminApi.get('/categories'));
  const products = useFetch<Product[]>(() => adminApi.get('/products'));
  const orders = useFetch<Order[]>(() => adminApi.get('/orders/all'));
  const vouchers = useFetch<Voucher[]>(() => adminApi.get('/vouchers'));

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && TABS.some(tab => tab.id === t)) setTab(t as Tab);
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-sky-50/30 p-2 sm:p-3 md:p-4 lg:p-6">
      <div className="w-full space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Panel Admin</h1>
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-2 sm:mx-0 px-2 sm:px-0">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    tab === t.id ? 'bg-primary text-white shadow-sm' : 'bg-white text-muted-foreground hover:text-primary border border-border'
                  }`}>
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {tab === 'users' && <UsersSection {...users} search={search} setSearch={setSearch} />}
        {tab === 'categories' && <CategoriesSection {...categories} search={search} setSearch={setSearch} />}
        {tab === 'products' && <ProductsSection {...products} search={search} setSearch={setSearch} categories={categories.data || []} />}
        {tab === 'orders' && <OrdersSection {...orders} search={search} setSearch={setSearch} />}
        {tab === 'vouchers' && <VouchersSection {...vouchers} search={search} setSearch={setSearch} />}
      </div>
    </main>
  );
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative w-full sm:w-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input type="text" placeholder={placeholder || 'Cari...'} value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full sm:w-72 pl-9 pr-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border"><div className="h-8 bg-muted rounded w-48 animate-pulse" /></div>
      {[1,2,3,4,5].map(i => (
        <div key={i} className="p-4 border-b border-border"><div className="h-5 bg-muted rounded w-full animate-pulse" /></div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-lg border border-border p-8 text-center text-muted-foreground text-sm">{message}</div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-white rounded-lg border border-border p-4 flex items-center gap-2 text-sm text-destructive">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span className="flex-1">{message}</span>
      <Button variant="ghost" size="sm" onClick={onRetry}>Ulangi</Button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[status] || 'bg-muted text-muted-foreground'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function CrudModal({ isOpen, onClose, title, children, onSave, saving }: {
  isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode;
  onSave: () => void; saving?: boolean;
}) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose} size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={onSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </>
      }>
      {children}
    </Modal>
  );
}

function ConfirmDelete({ id, onClose, onConfirm }: { id: string | null; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal isOpen={!!id} title="Konfirmasi Hapus" onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button variant="destructive" onClick={onConfirm}>Hapus</Button>
        </>
      }>
      <p className="text-sm text-muted-foreground">Yakin ingin menghapus data ini? Tindakan ini tidak bisa dibatalkan.</p>
    </Modal>
  );
}

function getRole(u: any): string {
  const roles = u.UserRoles?.map((ur: any) => ur.Role?.name).filter(Boolean);
  return roles?.length ? roles.join(', ') : '—';
}

function UsersSection({ data, loading, error, refetch, search, setSearch }: any) {
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', isActive: true, role: 'user' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = (data || []).filter((u: UserData) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEdit(null); setForm({ name: '', email: '', phone: '', isActive: true, role: 'user' }); setShow(true); };
  const openEdit = (u: UserData) => { setEdit(u); setForm({ name: u.name, email: u.email, phone: u.phone || '', isActive: u.isActive, role: getRole(u) }); setShow(true); };

  const handleSave = async () => {
    setSaving(true);
    if (edit) {
      await adminApi.put(`/users/profile`, { name: form.name, email: form.email, phone: form.phone, isActive: form.isActive });
      if (form.role && form.role !== getRole(edit)) {
        await adminApi.put(`/users/${edit.id}/role`, { role: form.role });
      }
    } else {
      await adminApi.post('/auth/register', { ...form, password: 'password123' });
    }
    setSaving(false); setShow(false); refetch();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await adminApi.del(`/users/${deleteId}`);
    setDeleteId(null); refetch();
  };

  const toggleActive = async (u: UserData) => {
    await adminApi.put(`/users/profile`, { name: u.name, email: u.email, phone: u.phone, isActive: !u.isActive });
    refetch();
  };

  if (loading) return <TableSkeleton />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!filtered.length) return <EmptyState message="Belum ada pengguna" />;

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Cari pengguna..." />
        <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={openCreate} className="w-full sm:w-auto">Tambah</Button>
      </div>
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-sky-50">
                    <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left font-semibold text-foreground">Nama</th>
                    <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left font-semibold text-foreground hidden sm:table-cell">Email</th>
                    <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left font-semibold text-foreground hidden md:table-cell">Role</th>
                    <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left font-semibold text-foreground hidden md:table-cell">Status</th>
                    <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-right font-semibold text-foreground">Aksi</th>
                  </tr>
                </thead>
            <tbody>
              {filtered.map((u: UserData) => (
                <tr key={u.id} className="border-b border-border hover:bg-sky-50/50 transition-colors">
                  <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate text-xs sm:text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">{u.email}</td>
                  <td className="px-2 sm:px-3 py-2 sm:py-2.5 hidden md:table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                      getRole(u) === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {getRole(u)}
                    </span>
                  </td>
                  <td className="px-2 sm:px-3 py-2 sm:py-2.5 hidden md:table-cell">
                    <button onClick={() => toggleActive(u)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                        u.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}>
                      {u.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteId(u.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs text-muted-foreground border-t border-border">
          {filtered.length} dari {(data || []).length} pengguna
        </div>
      </div>
      <CrudModal isOpen={show} onClose={() => setShow(false)} title={edit ? 'Edit Pengguna' : 'Tambah Pengguna'} onSave={handleSave} saving={saving}>
        <div className="space-y-3">
          <InputField label="Nama" value={form.name} onChange={v => setForm({ ...form, name: v })} />
          <InputField label="Email" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
          <InputField label="Telepon" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-input" /> Aktif</label>
        </div>
      </CrudModal>
      <ConfirmDelete id={deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}

function CategoriesSection({ data, loading, error, refetch, search, setSearch }: any) {
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', isActive: true, sortOrder: 0 });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = (data || []).filter((c: Category) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) || c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEdit(null); setForm({ name: '', slug: '', description: '', isActive: true, sortOrder: 0 }); setShow(true); };
  const openEdit = (c: Category) => { setEdit(c); setForm({ name: c.name, slug: c.slug, description: c.description || '', isActive: c.isActive, sortOrder: c.sortOrder }); setShow(true); };

  const handleSave = async () => {
    setSaving(true);
    const p = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') };
    if (edit) await adminApi.put(`/categories/${edit.id}`, p);
    else await adminApi.post('/categories', p);
    setSaving(false); setShow(false); refetch();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await adminApi.del(`/categories/${deleteId}`);
    setDeleteId(null); refetch();
  };

  if (loading) return <TableSkeleton />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!filtered.length) return <EmptyState message="Belum ada kategori" />;

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Cari kategori..." />
        <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={openCreate} className="w-full sm:w-auto">Tambah</Button>
      </div>
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-sky-50">
                <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left font-semibold">Nama</th>
                <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left font-semibold hidden sm:table-cell">Slug</th>
                <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left font-semibold hidden md:table-cell">Status</th>
                <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: Category) => (
                <tr key={c.id} className="border-b border-border hover:bg-sky-50/50 transition-colors">
                  <td className="px-2 sm:px-3 py-2 sm:py-2.5 font-medium text-xs sm:text-sm">{c.name}</td>
                  <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-muted-foreground text-xs hidden sm:table-cell">{c.slug}</td>
                  <td className="px-2 sm:px-3 py-2 sm:py-2.5 hidden md:table-cell">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${c.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{c.isActive ? 'Aktif' : 'Nonaktif'}</span>
                  </td>
                  <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs text-muted-foreground border-t border-border">{filtered.length} dari {(data || []).length} kategori</div>
      </div>
      <CrudModal isOpen={show} onClose={() => setShow(false)} title={edit ? 'Edit Kategori' : 'Tambah Kategori'} onSave={handleSave} saving={saving}>
        <div className="space-y-3">
          <InputField label="Nama" value={form.name} onChange={v => { setForm(f => ({ ...f, name: v })); if (!edit) setForm(f => ({ ...f, slug: v.toLowerCase().replace(/\s+/g, '-') })); }} />
          <InputField label="Slug" value={form.slug} onChange={v => setForm(f => ({ ...f, slug: v }))} />
          <div><label className="block text-sm font-medium mb-1">Deskripsi</label><textarea value={form.description} rows={2} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
          <InputField label="Urutan" type="number" value={String(form.sortOrder)} onChange={v => setForm(f => ({ ...f, sortOrder: parseInt(v) || 0 }))} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded border-input" /> Aktif</label>
        </div>
      </CrudModal>
      <ConfirmDelete id={deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}

function getProductImageUrl(p: any): string {
  const img = p.ProductImages?.find((i: any) => i.isPrimary) || p.ProductImages?.[0];
  if (!img) return '';
  return img.url.startsWith('http') ? img.url : img.url;
}

function ProductsSection({ data, loading, error, refetch, search, setSearch, categories }: any) {
   const [show, setShow] = useState(false);
   const [edit, setEdit] = useState<any>(null);
   const [form, setForm] = useState({ name: '', slug: '', description: '', price: 0, comparePrice: 0, stock: 0, sku: '', weight: 0, isActive: true, isFeatured: false, categoryId: '' });
   const [saving, setSaving] = useState(false);
   const [deleteId, setDeleteId] = useState<string | null>(null);
   const [uploading, setUploading] = useState(false);
   const [uploadedImages, setUploadedImages] = useState<string[]>([]);

   const filtered = (data || []).filter((p: Product) =>
     p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
   );

   const openCreate = () => {
     setEdit(null);
     setForm({ name: '', slug: '', description: '', price: 0, comparePrice: 0, stock: 0, sku: '', weight: 0, isActive: true, isFeatured: false, categoryId: '' });
     setUploadedImages([]);
     setShow(true);
   };

   const openEdit = (p: Product) => {
     setEdit(p);
     setForm({ name: p.name, slug: p.slug, description: p.description || '', price: p.price, comparePrice: p.comparePrice || 0, stock: p.stock, sku: p.sku || '', weight: p.weight || 0, isActive: p.isActive, isFeatured: p.isFeatured, categoryId: p.categoryId || '' });
     const existing = (p.ProductImages || []).map((i: any) => i.url);
     setUploadedImages(existing);
     setShow(true);
   };

   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const files = e.target.files;
     if (!files?.length) return;
     setUploading(true);
     try {
       const formData = new FormData();
       for (const f of files) formData.append('images', f);
       const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
       const token = localStorage.getItem('admin-token');
       const res = await fetch(`${apiUrl}/upload/images`, {
         method: 'POST',
         headers: { Authorization: `Bearer ${token}` },
         body: formData,
       });
       const json = await res.json();
       if (json.success && json.data) {
         const urls = json.data.map((f: any) => f.url);
         setUploadedImages(prev => [...prev, ...urls]);
       }
     } catch (err) {
       console.error('Upload failed', err);
     } finally {
       setUploading(false);
       if (e.target) e.target.value = '';
     }
   };

   const removeImage = (url: string) => {
     setUploadedImages(prev => prev.filter(u => u !== url));
   };

   const handleSave = async () => {
     setSaving(true);
     const payload: Record<string, any> = {
       ...form,
       slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
       price: Number(form.price),
       comparePrice: Number(form.comparePrice) || null,
       stock: Number(form.stock),
       images: uploadedImages.map((url, i) => ({
         url,
         isPrimary: i === 0,
         sortOrder: i,
       })),
     };
     if (!form.categoryId) delete payload.categoryId;
     const res = edit
       ? await adminApi.put(`/products/${edit.id}`, payload)
       : await adminApi.post('/products', payload);
     if (!res.success) {
       toast.error(res.error || 'Gagal menyimpan produk');
       setSaving(false);
       return;
     }
     toast.success(edit ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan');
     setSaving(false); setShow(false); refetch();
   };

   const handleDelete = async () => {
     if (!deleteId) return;
     await adminApi.del(`/products/${deleteId}`);
     setDeleteId(null); refetch();
   };

   if (loading) return <TableSkeleton />;
   if (error) return <ErrorState message={error} onRetry={refetch} />;
   if (!filtered.length) return <EmptyState message="Belum ada produk" />;

   return (
     <div className="space-y-2 sm:space-y-3">
       <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
         <SearchBar value={search} onChange={setSearch} placeholder="Cari produk..." />
         <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={openCreate} className="w-full sm:w-auto">Tambah</Button>
       </div>
       {/* Desktop Table View */}
       <div className="hidden sm:block bg-white rounded-lg border border-border overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-sm">
             <thead>
               <tr className="border-b border-border bg-sky-50">
                 <th className="px-3 py-2.5 text-left font-semibold">Produk</th>
                 <th className="px-3 py-2.5 text-left font-semibold hidden sm:table-cell">Harga</th>
                 <th className="px-3 py-2.5 text-left font-semibold hidden sm:table-cell">Stok</th>
                 <th className="px-3 py-2.5 text-left font-semibold hidden md:table-cell">Status</th>
                 <th className="px-3 py-2.5 text-right font-semibold">Aksi</th>
               </tr>
             </thead>
             <tbody>
               {filtered.map((p: Product) => (
                 <tr key={p.id} className="border-b border-border hover:bg-sky-50/50 transition-colors">
                   <td className="px-3 py-2.5">
                     <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                         {getProductImageUrl(p) ? (
                           <img src={getProductImageUrl(p)} alt="" className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
                         )}
                       </div>
                       <div className="min-w-0">
                         <p className="font-medium text-foreground truncate">{p.name}</p>
                         <p className="text-xs text-muted-foreground">{p.sku || '-'}</p>
                       </div>
                     </div>
                   </td>
                   <td className="px-3 py-2.5 hidden sm:table-cell font-medium">Rp {Number(p.price).toLocaleString()}</td>
                   <td className="px-3 py-2.5 hidden sm:table-cell">
                     <span className={p.stock < 10 ? 'text-destructive font-medium' : ''}>{p.stock}</span>
                   </td>
                   <td className="px-3 py-2.5 hidden md:table-cell">
                     <div className="flex gap-1">
                       <span className={`px-1.5 py-0.5 text-xs rounded-full ${p.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{p.isActive ? 'Aktif' : 'Nonaktif'}</span>
                       {p.isFeatured && <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600">Unggulan</span>}
                     </div>
                   </td>
                   <td className="px-3 py-2.5 text-right">
                     <div className="flex items-center justify-end gap-1">
                       <button onClick={() => openEdit(p)} className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                       <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
         <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border">{filtered.length} dari {(data || []).length} produk</div>
       </div>
       
       {/* Mobile Card View */}
       <div className="sm:hidden space-y-2">
         {filtered.map((p: Product) => (
           <div key={p.id} className="bg-white rounded-lg border border-border p-3 space-y-2">
             <div className="flex items-start gap-3">
               <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                 {getProductImageUrl(p) ? (
                   <img src={getProductImageUrl(p)} alt="" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
                 )}
               </div>
               <div className="flex-1 min-w-0">
                 <p className="font-semibold text-foreground text-sm truncate">{p.name}</p>
                 <p className="text-xs text-muted-foreground mb-1">{p.sku || '-'}</p>
                 <div className="flex gap-1 flex-wrap">
                   <span className={`px-2 py-0.5 text-xs rounded-full ${p.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{p.isActive ? 'Aktif' : 'Nonaktif'}</span>
                   {p.isFeatured && <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600">Unggulan</span>}
                 </div>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-2 text-sm">
               <div>
                 <p className="text-xs text-muted-foreground">Harga</p>
                 <p className="font-semibold">Rp {Number(p.price).toLocaleString()}</p>
               </div>
               <div>
                 <p className="text-xs text-muted-foreground">Stok</p>
                 <p className={`font-semibold ${p.stock < 10 ? 'text-destructive' : ''}`}>{p.stock}</p>
               </div>
             </div>
             <div className="flex gap-2 pt-2 border-t border-border">
               <button onClick={() => openEdit(p)} className="flex-1 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                 <Pencil className="w-4 h-4" /> Edit
               </button>
               <button onClick={() => setDeleteId(p.id)} className="flex-1 px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                 <Trash2 className="w-4 h-4" /> Hapus
               </button>
             </div>
           </div>
         ))}
         <div className="text-xs text-muted-foreground text-center py-2">{filtered.length} dari {(data || []).length} produk</div>
       </div>

       <CrudModal isOpen={show} onClose={() => setShow(false)} title={edit ? 'Edit Produk' : 'Tambah Produk'} onSave={handleSave} saving={saving}>
         <div className="space-y-3">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <InputField label="Nama" value={form.name} onChange={v => { setForm(f => ({ ...f, name: v })); if (!edit) setForm(f => ({ ...f, slug: v.toLowerCase().replace(/\s+/g, '-') })); }} />
             <InputField label="SKU" value={form.sku} onChange={v => setForm(f => ({ ...f, sku: v }))} />
           </div>
           <InputField label="Slug" value={form.slug} onChange={v => setForm(f => ({ ...f, slug: v }))} />
           <div>
             <label className="block text-sm font-medium mb-1">Deskripsi</label>
             <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
               rows={3}
               className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-vertical"
               placeholder="Deskripsi produk..." />
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <InputField label="Harga" type="number" value={String(form.price)} onChange={v => setForm(f => ({ ...f, price: Number(v) }))} />
             <InputField label="Harga Asli" type="number" value={String(form.comparePrice)} onChange={v => setForm(f => ({ ...f, comparePrice: Number(v) }))} />
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <InputField label="Stok" type="number" value={String(form.stock)} onChange={v => setForm(f => ({ ...f, stock: Number(v) }))} />
             <InputField label="Berat (kg)" type="number" value={String(form.weight)} onChange={v => setForm(f => ({ ...f, weight: Number(v) }))} />
           </div>
           <div>
             <label className="block text-sm font-medium mb-1">Kategori</label>
             <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
               className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
               <option value="">Tanpa kategori</option>
               {(categories || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
           </div>
           <div>
             <label className="block text-sm font-medium mb-2">Gambar Produk</label>
             <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
               {uploadedImages.map((url, i) => (
                 <div key={i} className="relative w-full aspect-square rounded-lg border border-border overflow-hidden group">
                   <img src={url} alt="" className="w-full h-full object-cover" />
                   <button onClick={() => removeImage(url)}
                     className="absolute top-1 right-1 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                 </div>
               ))}
               <label className="w-full aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors bg-white/50">
                 {uploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <Plus className="w-5 h-5 text-muted-foreground" />}
                 <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
               </label>
             </div>
           </div>
           <div className="flex flex-col sm:flex-row gap-3">
             <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded border-input" /> Aktif</label>
             <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4 rounded border-input" /> Unggulan</label>
           </div>
         </div>
       </CrudModal>
       <ConfirmDelete id={deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
     </div>
   );
 }

function OrdersSection({ data, loading, error, refetch, search, setSearch }: any) {
  const [selected, setSelected] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const filtered = (data || []).filter((o: Order) =>
    (o.orderNumber || o.id)?.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async () => {
    if (!selected || !newStatus || newStatus === selected.status) return;
    setUpdating(true);
    await adminApi.put(`/orders/${selected.id}/status`, { status: newStatus });
    setUpdating(false); setSelected(null); refetch();
  };

  if (loading) return <TableSkeleton />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!filtered.length) return <EmptyState message="Belum ada pesanan" />;

  return (
    <div className="space-y-3">
      <SearchBar value={search} onChange={setSearch} placeholder="Cari pesanan..." />
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-sky-50">
                <th className="px-3 py-2.5 text-left font-semibold">Pesanan</th>
                <th className="px-3 py-2.5 text-left font-semibold hidden sm:table-cell">Status</th>
                <th className="px-3 py-2.5 text-left font-semibold hidden sm:table-cell">Total</th>
                <th className="px-3 py-2.5 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o: Order) => (
                <tr key={o.id} className="border-b border-border hover:bg-sky-50/50 transition-colors">
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-foreground">{o.orderNumber || o.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('id-ID')}</p>
                  </td>
                  <td className="px-3 py-2.5 hidden sm:table-cell"><StatusBadge status={o.status} /></td>
                  <td className="px-3 py-2.5 hidden sm:table-cell font-medium">Rp {(o.total || o.subtotal || 0).toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right">
                    <button onClick={() => { setSelected(o); setNewStatus(o.status); }} className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary"><Eye className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border">{filtered.length} dari {(data || []).length} pesanan</div>
      </div>
      <Modal isOpen={!!selected} title={`Pesanan ${selected?.orderNumber || selected?.id?.slice(0,8) || ''}`} onClose={() => setSelected(null)} size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)}>Tutup</Button>
            {newStatus && newStatus !== selected?.status && <Button onClick={updateStatus} disabled={updating}>{updating ? 'Menyimpan...' : 'Update Status'}</Button>}
          </>
        }>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-muted-foreground">ID Pesanan</p><p className="text-sm font-medium">{selected.id}</p></div>
              <div><p className="text-xs text-muted-foreground">Tanggal</p><p className="text-sm font-medium">{new Date(selected.createdAt).toLocaleString('id-ID')}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-muted-foreground">Subtotal</p><p className="text-sm font-medium">Rp {(selected.subtotal || 0).toLocaleString()}</p></div>
              <div><p className="text-xs text-muted-foreground">Ongkir</p><p className="text-sm font-medium">Rp {(selected.shippingCost || 0).toLocaleString()}</p></div>
            </div>
            <div><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold text-primary">Rp {(selected.total || selected.subtotal || 0).toLocaleString()}</p></div>
            {selected.notes && <div><p className="text-xs text-muted-foreground">Catatan</p><p className="text-sm">{selected.notes}</p></div>}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {ORDER_STATUSES.map(s => (
                  <button key={s} onClick={() => setNewStatus(s)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                      newStatus === s ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function VouchersSection({ data, loading, error, refetch, search, setSearch }: any) {
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [form, setForm] = useState({ code: '', name: '', type: 'percentage', value: 0, minOrder: 0, maxDiscount: 0, usageLimit: 0, startsAt: '', endsAt: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = (data || []).filter((v: Voucher) =>
    v.code?.toLowerCase().includes(search.toLowerCase()) || v.name?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEdit(null); setForm({ code: '', name: '', type: 'percentage', value: 0, minOrder: 0, maxDiscount: 0, usageLimit: 0, startsAt: '', endsAt: '', isActive: true }); setShow(true); };
  const openEdit = (v: Voucher) => { setEdit(v); setForm({ code: v.code, name: v.name || '', type: v.type || 'percentage', value: v.value, minOrder: v.minOrder, maxDiscount: v.maxDiscount || 0, usageLimit: v.usageLimit || 0, startsAt: v.startsAt ? v.startsAt.slice(0,10) : '', endsAt: v.endsAt ? v.endsAt.slice(0,10) : '', isActive: v.isActive }); setShow(true); };

  const handleSave = async () => {
    setSaving(true);
    const p = { ...form, value: Number(form.value), minOrder: Number(form.minOrder), maxDiscount: Number(form.maxDiscount) || null, usageLimit: Number(form.usageLimit) || null, startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null, endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null };
    if (edit) await adminApi.put(`/vouchers/${edit.id}`, p);
    else await adminApi.post('/vouchers', p);
    setSaving(false); setShow(false); refetch();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await adminApi.del(`/vouchers/${deleteId}`);
    setDeleteId(null); refetch();
  };

  if (loading) return <TableSkeleton />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!filtered.length) return <EmptyState message="Belum ada voucher" />;

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Cari pesanan..." />
      </div>
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-sky-50">
                <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left font-semibold">Pesanan</th>
                <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left font-semibold hidden sm:table-cell">Status</th>
                <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left font-semibold hidden sm:table-cell">Total</th>
                <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o: Order) => (
                <tr key={o.id} className="border-b border-border hover:bg-sky-50/50 transition-colors">
                  <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                    <p className="font-medium text-foreground text-xs sm:text-sm">{o.orderNumber || o.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('id-ID')}</p>
                  </td>
                  <td className="px-2 sm:px-3 py-2 sm:py-2.5 hidden sm:table-cell"><StatusBadge status={o.status} /></td>
                  <td className="px-2 sm:px-3 py-2 sm:py-2.5 hidden sm:table-cell font-medium text-xs sm:text-sm">Rp {(o.total || o.subtotal || 0).toLocaleString()}</td>
                  <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-right">
                    <button onClick={() => { setSelected(o); setNewStatus(o.status); }} className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary"><Eye className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs text-muted-foreground border-t border-border">{filtered.length} dari {(data || []).length} pesanan</div>
      </div>
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-sky-50">
                <th className="px-3 py-2.5 text-left font-semibold">Kode</th>
                <th className="px-3 py-2.5 text-left font-semibold hidden sm:table-cell">Nilai</th>
                <th className="px-3 py-2.5 text-left font-semibold hidden sm:table-cell">Terpakai</th>
                <th className="px-3 py-2.5 text-left font-semibold hidden md:table-cell">Status</th>
                <th className="px-3 py-2.5 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v: Voucher) => {
                const expired = v.endsAt && new Date(v.endsAt) < new Date();
                return (
                  <tr key={v.id} className="border-b border-border hover:bg-sky-50/50 transition-colors">
                    <td className="px-3 py-2.5">
                      <span className="font-mono font-bold text-foreground uppercase">{v.code}</span>
                      {v.name && <p className="text-xs text-muted-foreground">{v.name}</p>}
                    </td>
                    <td className="px-3 py-2.5 hidden sm:table-cell text-sm">{v.type === 'percentage' ? `${v.value}%` : `Rp ${v.value.toLocaleString()}`}</td>
                    <td className="px-3 py-2.5 hidden sm:table-cell text-sm text-muted-foreground">{v.usedCount}{v.usageLimit ? ` / ${v.usageLimit}` : ''}</td>
                    <td className="px-3 py-2.5 hidden md:table-cell">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        expired ? 'bg-destructive/10 text-destructive' : !v.isActive ? 'bg-muted text-muted-foreground' : 'bg-success/10 text-success'
                      }`}>{expired ? 'Kadaluarsa' : v.isActive ? 'Aktif' : 'Nonaktif'}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(v)} className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(v.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border">{filtered.length} dari {(data || []).length} voucher</div>
      </div>
      <CrudModal isOpen={show} onClose={() => setShow(false)} title={edit ? 'Edit Voucher' : 'Tambah Voucher'} onSave={handleSave} saving={saving}>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField label="Kode" value={form.code} onChange={v => setForm(f => ({ ...f, code: v.toUpperCase() }))} />
            <InputField label="Nama" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Tipe</label><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"><option value="percentage">Persen</option><option value="nominal">Nominal</option></select></div>
            <InputField label="Nilai" type="number" value={String(form.value)} onChange={v => setForm(f => ({ ...f, value: Number(v) }))} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField label="Min. Pesanan" type="number" value={String(form.minOrder)} onChange={v => setForm(f => ({ ...f, minOrder: Number(v) }))} />
            <InputField label="Maks. Diskon" type="number" value={String(form.maxDiscount)} onChange={v => setForm(f => ({ ...f, maxDiscount: Number(v) }))} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField label="Batas Pemakaian" type="number" value={String(form.usageLimit)} onChange={v => setForm(f => ({ ...f, usageLimit: Number(v) }))} />
            <InputField label="Tanggal Mulai" type="date" value={form.startsAt} onChange={v => setForm(f => ({ ...f, startsAt: v }))} />
          </div>
          <InputField label="Tanggal Berakhir" type="date" value={form.endsAt} onChange={v => setForm(f => ({ ...f, endsAt: v }))} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded border-input" /> Aktif</label>
        </div>
      </CrudModal>
      <ConfirmDelete id={deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Memuat...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
