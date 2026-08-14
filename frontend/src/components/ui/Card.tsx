import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'outlined' | 'subtle';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const variantStyles = {
    default: 'bg-bone-white border border-charcoal-soft/10 shadow-sm rounded-lg',
    glass: 'glass-card rounded-lg',
    outlined: 'border border-charcoal-soft/15 bg-transparent rounded-lg',
    subtle: 'bg-surface-container border border-surface-container-high rounded-lg',
  };

  return (
    <div
      className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
