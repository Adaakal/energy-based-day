export default function DashboardLoading() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8 animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-36" />
      </div>
      <div className="rounded-2xl border-2 border-gray-200 bg-gray-50 p-6 mb-6 h-40" />
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[0, 1, 2].map(i => (
          <div key={i} className="bg-gray-100 rounded-xl h-20" />
        ))}
      </div>
      <div className="bg-gray-100 rounded-xl h-40 mb-4" />
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-100 rounded-xl h-24" />
        <div className="bg-gray-100 rounded-xl h-24" />
      </div>
    </div>
  )
}
