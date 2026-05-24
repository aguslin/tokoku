'use client';

import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
}

const variantStyles = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1.5 text-sm',
  lg: 'px-3 py-2 text-base',
};

export const Badge = ({
  variant = 'secondary',
  size = 'md',
  children,
  className = '',
}: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-full whitespace-nowrap ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
