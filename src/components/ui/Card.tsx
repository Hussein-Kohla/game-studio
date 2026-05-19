import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from './Button';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'none' | 'green' | 'red' | 'purple' | 'blue';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow = 'none', children, ...props }, ref) => {
    
    const glows = {
      none: '',
      green: 'glow-green',
      red: 'glow-red',
      purple: 'glow-purple',
      blue: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'glass-panel rounded-2xl p-6 transition-all duration-300',
          glows[glow],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
