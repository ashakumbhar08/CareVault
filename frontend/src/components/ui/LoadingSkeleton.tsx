interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'stat';
  count?: number;
}

export const LoadingSkeleton = ({ variant = 'card', count = 1 }: LoadingSkeletonProps) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (variant === 'card') {
    return (
      <>
        {skeletons.map((i) => (
          <div key={i} className="bg-card rounded-card p-6 shadow-custom animate-pulse">
            <div className="h-4 bg-surface-hover rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-surface-hover rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-surface-hover rounded w-1/4"></div>
          </div>
        ))}
      </>
    );
  }

  if (variant === 'list') {
    return (
      <>
        {skeletons.map((i) => (
          <div key={i} className="flex items-center gap-4 py-3 animate-pulse">
            <div className="w-10 h-10 bg-surface-hover rounded-full"></div>
            <div className="flex-1">
              <div className="h-3 bg-surface-hover rounded w-1/3 mb-2"></div>
              <div className="h-2 bg-surface-hover rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <div className="bg-card rounded-card p-4 shadow-custom animate-pulse">
      <div className="h-3 bg-surface-hover rounded w-1/2 mb-2"></div>
      <div className="h-6 bg-surface-hover rounded w-1/3"></div>
    </div>
  );
};
