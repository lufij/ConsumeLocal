import { Bell } from 'lucide-react';
import { cn } from './ui/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function NotificationBadge({ count, className, size = 'md', onClick }: NotificationBadgeProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const badgeSizes = {
    sm: 'min-w-[16px] h-4 text-[10px]',
    md: 'min-w-[18px] h-[18px] text-[11px]',
    lg: 'min-w-[20px] h-5 text-xs',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full transition-all',
        'hover:bg-gray-100 active:bg-gray-200',
        sizes[size],
        className
      )}
    >
      <Bell size={iconSizes[size]} className="text-gray-600" />
      
      {count > 0 && (
        <span
          className={cn(
            'absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-500 px-1',
            'animate-in fade-in zoom-in duration-300',
            badgeSizes[size]
          )}
        >
          <span className="text-white font-medium">
            {count > 99 ? '99+' : count}
          </span>
        </span>
      )}
    </button>
  );
}
