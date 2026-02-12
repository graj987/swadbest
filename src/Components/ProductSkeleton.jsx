const ProductSkeleton = () => {
  return (
    <div className="border rounded-xl p-3 animate-pulse">
      {/* IMAGE */}
      <div className="h-36 w-full bg-gray-200 rounded-lg" />

      {/* TEXT */}
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-300 rounded w-1/3" />
      </div>
    </div>
  );
};

export default ProductSkeleton;
