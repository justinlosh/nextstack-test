interface ContentSkeletonProps {
  contentType: string
  className?: string
}

/**
 * Displays a skeleton loader while content is being fetched
 */
export default function ContentSkeleton({ contentType, className = "" }: ContentSkeletonProps) {
  // Choose skeleton based on content type
  switch (contentType) {
    case "page":
      return <PageSkeleton className={className} />
    case "post":
      return <PostSkeleton className={className} />
    case "product":
      return <ProductSkeleton className={className} />
    default:
      return <GenericSkeleton className={className} />
  }
}

/**
 * Skeleton for Page content type
 */
function PageSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      {/* Title */}
      <div className="h-10 bg-gray-200 rounded-md w-3/4 mb-6"></div>

      {/* Excerpt */}
      <div className="h-6 bg-gray-200 rounded-md w-full mb-2"></div>
      <div className="h-6 bg-gray-200 rounded-md w-2/3 mb-6"></div>

      {/* Featured Image */}
      <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>

      {/* Content */}
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-4/5"></div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
      </div>
    </div>
  )
}

/**
 * Skeleton for Post content type
 */
function PostSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      {/* Title */}
      <div className="h-10 bg-gray-200 rounded-md w-3/4 mb-4"></div>

      {/* Author & Date */}
      <div className="flex items-center mb-6">
        <div className="h-4 bg-gray-200 rounded-md w-32 mr-4"></div>
        <div className="h-4 bg-gray-200 rounded-md w-48"></div>
      </div>

      {/* Excerpt */}
      <div className="h-6 bg-gray-200 rounded-md w-full mb-2"></div>
      <div className="h-6 bg-gray-200 rounded-md w-2/3 mb-6"></div>

      {/* Featured Image */}
      <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>

      {/* Content */}
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-4/5"></div>
      </div>

      {/* Categories */}
      <div className="mb-2">
        <div className="h-4 bg-gray-200 rounded-md w-24 mb-2"></div>
        <div className="flex flex-wrap gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <div className="h-4 bg-gray-200 rounded-md w-16 mb-2"></div>
        <div className="flex flex-wrap gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for Product content type
 */
function ProductSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      {/* Title */}
      <div className="h-10 bg-gray-200 rounded-md w-3/4 mb-6"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Product Images */}
        <div>
          <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
          <div className="grid grid-cols-4 gap-2">
            <div className="h-16 bg-gray-200 rounded-md"></div>
            <div className="h-16 bg-gray-200 rounded-md"></div>
            <div className="h-16 bg-gray-200 rounded-md"></div>
            <div className="h-16 bg-gray-200 rounded-md"></div>
          </div>
        </div>

        {/* Product Details */}
        <div>
          {/* Price */}
          <div className="h-8 bg-gray-200 rounded-md w-32 mb-2"></div>

          {/* SKU */}
          <div className="h-4 bg-gray-200 rounded-md w-24 mb-2"></div>

          {/* Stock */}
          <div className="h-4 bg-gray-200 rounded-md w-40 mb-6"></div>

          {/* Description */}
          <div className="space-y-3 mb-6">
            <div className="h-4 bg-gray-200 rounded-md w-full"></div>
            <div className="h-4 bg-gray-200 rounded-md w-full"></div>
            <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-md w-full"></div>
          </div>

          {/* Specifications */}
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded-md w-32 mb-2"></div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="h-4 bg-gray-200 rounded-md"></div>
              <div className="h-4 bg-gray-200 rounded-md"></div>
              <div className="h-4 bg-gray-200 rounded-md"></div>
              <div className="h-4 bg-gray-200 rounded-md"></div>
              <div className="h-4 bg-gray-200 rounded-md"></div>
              <div className="h-4 bg-gray-200 rounded-md"></div>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-2">
            <div className="h-4 bg-gray-200 rounded-md w-24 mb-2"></div>
            <div className="flex flex-wrap gap-2">
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              <div className="h-6 bg-gray-200 rounded-full w-24"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Generic skeleton for unknown content types
 */
function GenericSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      {/* Title */}
      <div className="h-10 bg-gray-200 rounded-md w-3/4 mb-6"></div>

      {/* Content */}
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-4/5"></div>
      </div>

      {/* Additional fields */}
      <div className="h-32 bg-gray-200 rounded-md w-full"></div>
    </div>
  )
}
