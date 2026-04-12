export default function PlanLoading() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-6 bg-gray-200 rounded-lg w-28 mb-2" />
      <div className="h-7 bg-gray-100 rounded w-52 mb-1" />
      <div className="h-4 bg-gray-100 rounded w-64 mb-6" />
      <div className="bg-gray-100 rounded-xl h-16 mb-6" />
      <div className="bg-gray-100 rounded-xl h-24 mb-4" />
      <div className="space-y-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="bg-gray-100 rounded-xl h-20" />
        ))}
      </div>
    </div>
  )
}
