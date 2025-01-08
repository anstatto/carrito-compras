export default function CategoryLoading() {
  return (
    <div className="animate-pulse">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 h-[400px]">
              <div className="w-full h-64 bg-gray-200 rounded-lg mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-8 w-full bg-gray-200 rounded-lg mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 