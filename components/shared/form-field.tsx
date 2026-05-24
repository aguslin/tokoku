'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | { message?: string };
  helperText?: string;
  required?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, required, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-foreground block">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2.5 text-sm border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed ${
            error
              ? 'border-destructive focus:ring-destructive'
              : 'border-input hover:border-input/80'
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-destructive font-medium">
            {typeof error === 'string' ? error : error.message}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
