export default function ProductSkeleton() {
  return (
    <div className="bg-white border rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-9 bg-gray-300 rounded mt-2" />
      </div>
    </div>
  );
}
