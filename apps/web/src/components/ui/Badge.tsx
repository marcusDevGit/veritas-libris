import React from 'react';
import { cn } from '../../utils/cn.js';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'error' | 'gold';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}) => {
  const base = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-surface-container-high text-on-surface-variant',
    outline: 'border border-outline/30 text-on-surface-variant bg-transparent',
    success: 'bg-success-container text-success font-semibold',
    warning: 'bg-warning-container text-secondary font-semibold',
    error: 'bg-error-container text-error font-semibold',
    gold: 'bg-secondary-container text-on-secondary-container font-semibold',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 tracking-wide',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
