import React from 'react';

export const BookCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-surface border border-outline/10 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[2/3] w-full bg-surface-container-high" />

      <div className="p-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="h-4 w-12 bg-surface-container-high rounded-full" />
          <div className="h-4 w-8 bg-surface-container-high rounded-full" />
        </div>
        <div className="h-5 w-3/4 bg-surface-container-high rounded-md" />
        <div className="h-3 w-1/2 bg-surface-container-high rounded-md" />
      </div>
    </div>
  );
};
