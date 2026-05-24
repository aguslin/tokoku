'use client';

import { ReactNode } from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  count?: number;
  circle?: boolean;
  className?: string;
}

export const Skeleton = ({
  width = '100%',
  height = '1rem',
  count = 1,
  circle = false,
  className = '',
}: SkeletonProps) => {
  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, i) => (
        <div
          key={i}
          style={{ width, height }}
          className={`bg-muted animate-pulse rounded-md ${
            circle ? 'rounded-full' : ''
          } ${className} mb-2`}
        />
      ))}
    </>
  );
};
