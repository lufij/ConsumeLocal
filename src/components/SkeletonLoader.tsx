import { Card } from './ui/card';

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="p-4">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
        
        {/* Price */}
        <div className="h-6 bg-gray-200 rounded mb-3 w-1/3" />
        
        {/* Store info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StoreCardSkeleton() {
  return (
    <Card className="p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        {/* Logo skeleton */}
        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
        
        <div className="flex-1">
          {/* Store name */}
          <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
          {/* Location */}
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      
      {/* Description */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
    </Card>
  );
}

export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 animate-pulse border-b border-gray-100">
      {/* Avatar */}
      <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        {/* Name */}
        <div className="h-5 bg-gray-200 rounded mb-2 w-1/2" />
        {/* Message preview */}
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
      
      {/* Time */}
      <div className="h-4 bg-gray-200 rounded w-12" />
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <Card className="p-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-6 bg-gray-200 rounded-full w-20" />
      </div>
      
      {/* Store info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded mb-2 w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      
      {/* Items */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
      
      {/* Total */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="h-5 bg-gray-200 rounded w-16" />
        <div className="h-6 bg-gray-200 rounded w-24" />
      </div>
    </Card>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-2 mb-3 animate-pulse">
      <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded mb-2 w-1/4" />
        <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
          <div className="h-4 bg-gray-200 rounded mb-2 w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-emerald-600 border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-500">Cargando...</p>
    </div>
  );
}
