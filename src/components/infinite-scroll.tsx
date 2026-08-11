'use client';

import { useEffect, type ReactNode } from "react";
import { useInView } from "react-intersection-observer";
import { LoadingSpinner } from "./loading-spinner";

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  children: ReactNode;
}

export function InfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  children,
}: InfiniteScrollProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoading, onLoadMore]);

  return (
    <>
      {children}
      {(hasMore || isLoading) && (
        <div ref={ref} className="w-full flex justify-center py-8">
          {isLoading && <LoadingSpinner size="md" />}
        </div>
      )}
    </>
  );
}
