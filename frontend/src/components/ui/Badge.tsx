import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'sage' | 'blue' | 'slate' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'sage',
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  const variantStyles = {
    sage: 'bg-sage-muted/40 text-slate-deep border border-sage-accent/30',
    blue: 'bg-clinical-blue-light text-clinical-blue border border-clinical-blue/20',
    slate: 'bg-surface-container text-slate-deep border border-charcoal-soft/10',
    error: 'bg-error-container text-on-error-container border border-error/20',
    neutral: 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30',
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded tracking-wide ${sizeStyles[size]} ${variantStyles[variant]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
    >
      {children}
    </span>
  );
};
