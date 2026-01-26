export default function SkeletonCard() {
  return (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-lg overflow-hidden">
      {/* Icon skeleton */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-gray-700 rounded-lg skeleton-shimmer"></div>
      </div>
      
      {/* Title skeleton */}
      <div className="mb-4">
        <div className="h-6 bg-gray-700 rounded-lg skeleton-shimmer w-3/4 mx-auto"></div>
      </div>
      
      {/* Description skeleton - 2 lines */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded skeleton-shimmer"></div>
        <div className="h-4 bg-gray-700 rounded skeleton-shimmer w-5/6 mx-auto"></div>
      </div>
    </div>
  );
}
