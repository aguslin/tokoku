'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart3, Users, ShoppingBag, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { DataTable, type Column } from '@/components/shared/data-table';
import { Modal } from '@/components/shared/modal';

interface Order {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  orders: number;
  totalSpent: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    email: 'john@example.com',
    amount: 299.99,
    status: 'completed',
    date: '2024-05-20',
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    email: 'jane@example.com',
    amount: 159.99,
    status: 'processing',
    date: '2024-05-21',
  },
  {
    id: 'ORD-003',
    customer: 'Bob Johnson',
    email: 'bob@example.com',
    amount: 499.99,
    status: 'completed',
    date: '2024-05-21',
  },
];

const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    joinDate: '2024-01-15',
    orders: 12,
    totalSpent: 2499.99,
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    joinDate: '2024-02-20',
    orders: 8,
    totalSpent: 1699.99,
  },
  {
    id: 'user-3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    joinDate: '2024-03-10',
    orders: 15,
    totalSpent: 3999.99,
  },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Wireless Headphones',
    category: 'Electronics',
    price: 129.99,
    stock: 45,
    sold: 128,
  },
  {
    id: 'prod-2',
    name: 'Cotton T-Shirt',
    category: 'Fashion',
    price: 19.99,
    stock: 200,
    sold: 450,
  },
  {
    id: 'prod-3',
    name: 'Coffee Maker',
    category: 'Home',
    price: 49.99,
    stock: 30,
    sold: 87,
  },
];

function DashboardContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'users' | 'products'>('overview');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'orders' || tab === 'users' || tab === 'products') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const stats = [
    {
      label: 'Total Revenue',
      value: '$12,345.99',
      change: 12.5,
      icon: TrendingUp,
    },
    {
      label: 'Total Orders',
      value: '1,234',
      change: 8.2,
      icon: ShoppingBag,
    },
    {
      label: 'Active Users',
      value: '892',
      change: 5.1,
      icon: Users,
    },
    {
      label: 'Average Order',
      value: '$94.32',
      change: -2.3,
      icon: BarChart3,
    },
  ];

  const orderColumns: Column<Order>[] = [
    { key: 'id', label: 'Order ID', sortable: true, searchable: true },
    { key: 'customer', label: 'Customer', sortable: true, searchable: true },
    { key: 'email', label: 'Email', sortable: true, searchable: true },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value) => `$${value.toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value === 'completed'
            ? 'bg-success/10 text-success'
            : value === 'processing'
            ? 'bg-info/10 text-info'
            : value === 'pending'
            ? 'bg-warning/10 text-warning'
            : 'bg-destructive/10 text-destructive'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    { key: 'date', label: 'Date', sortable: true },
  ];

  const userColumns: Column<User>[] = [
    { key: 'name', label: 'Name', sortable: true, searchable: true },
    { key: 'email', label: 'Email', sortable: true, searchable: true },
    { key: 'joinDate', label: 'Joined', sortable: true },
    { key: 'orders', label: 'Orders', sortable: true },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      sortable: true,
      render: (value) => `$${value.toFixed(2)}`,
    },
  ];

  const productColumns: Column<Product>[] = [
    { key: 'name', label: 'Product Name', sortable: true, searchable: true },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (value) => `$${value.toFixed(2)}`,
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      render: (value) => (
        <span className={value < 50 ? 'text-warning font-medium' : ''}>{value}</span>
      ),
    },
    { key: 'sold', label: 'Sold', sortable: true },
  ];

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s your marketplace overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isPositive = stat.change >= 0;

            return (
              <Card key={stat.label} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <ArrowUpRight className="w-4 h-4 text-success" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-destructive" />
                  )}
                  <span className={isPositive ? 'text-success' : 'text-destructive'}>
                    {Math.abs(stat.change)}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {[
            { id: 'overview' as const, label: 'Overview' },
            { id: 'orders' as const, label: 'Orders' },
            { id: 'users' as const, label: 'Users' },
            { id: 'products' as const, label: 'Products' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <h2 className="text-lg font-bold text-foreground mb-4">Recent Orders</h2>
              <div className="space-y-3">
                {MOCK_ORDERS.slice(0, 3).map(order => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">${order.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button fullWidth variant="outline">Add New Product</Button>
                <Button fullWidth variant="outline">View Reports</Button>
                <Button fullWidth variant="outline">Manage Sellers</Button>
                <Button fullWidth variant="outline">System Settings</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <DataTable
            columns={orderColumns}
            data={MOCK_ORDERS}
            actions={[
              {
                label: 'View',
                onClick: (order) => setSelectedOrder(order),
                variant: 'outline',
              },
              {
                label: 'Cancel',
                onClick: (order) => console.log('Cancel order:', order.id),
                variant: 'destructive',
              },
            ]}
            searchable
            sortable
            exportable
            onExport={() => console.log('Export orders')}
          />
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <DataTable
            columns={userColumns}
            data={MOCK_USERS}
            searchable
            sortable
            exportable
            onExport={() => console.log('Export users')}
          />
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <DataTable
            columns={productColumns}
            data={MOCK_PRODUCTS}
            searchable
            sortable
            selectable
            exportable
            onExport={() => console.log('Export products')}
          />
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <Modal
            isOpen={true}
            title={`Order ${selectedOrder.id}`}
            onClose={() => setSelectedOrder(null)}
            footer={
              <>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                <Button>Update Status</Button>
              </>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium text-foreground">{selectedOrder.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{selectedOrder.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-lg font-bold text-primary">${selectedOrder.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium text-foreground capitalize">{selectedOrder.status}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium text-foreground">{selectedOrder.date}</p>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </main>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Memuat...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
