'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  closeOnBackdropClick?: boolean;
}

const sizeStyles = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
};

export const Modal = ({
  isOpen,
  title,
  children,
  onClose,
  footer,
  size = 'md',
  closeOnBackdropClick = true,
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => closeOnBackdropClick && onClose()}
      />

      {/* Modal - Full screen on mobile, constrained on desktop */}
      <div className={`relative bg-card rounded-lg shadow-xl w-full max-h-[90vh] overflow-hidden flex flex-col ${sizeStyles[size]}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-foreground truncate pr-2">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-border p-3 sm:p-4 flex gap-2 justify-end flex-wrap flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
