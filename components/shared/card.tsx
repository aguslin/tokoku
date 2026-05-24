'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  hoverable?: boolean;
}

export const Card = ({
  children,
  className = '',
  noPadding = false,
  hoverable = false,
}: CardProps) => {
  return (
    <div
      className={`bg-card text-card-foreground rounded-lg border border-border shadow-sm transition-all duration-200 ${
        hoverable ? 'hover:shadow-md hover:border-primary/20' : ''
      } ${!noPadding ? 'p-4' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
