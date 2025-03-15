/* eslint-disable */
export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between">
        <div className="w-1/3 h-10 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="w-32 h-10 bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="ml-5 w-full">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Skeleton */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-40"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="w-1/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-1/5 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-1/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-1/6 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-1/6 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
            </div>
            <div className="border-t border-gray-200 px-4 py-5">
              <div className="space-y-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex flex-col space-y-2">
                    <div className="flex justify-between">
                      <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-1/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-full h-px bg-gray-100"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Stats Skeleton */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-60"></div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg p-4 bg-gray-50">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 