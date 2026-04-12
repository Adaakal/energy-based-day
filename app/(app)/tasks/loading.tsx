export default function TasksLoading() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-32 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-48 mb-6" />
      <div className="flex justify-between mb-4">
        <div className="bg-gray-100 rounded-lg h-9 w-40" />
        <div className="bg-gray-200 rounded-lg h-9 w-28" />
      </div>
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="bg-gray-100 rounded-xl h-20" />
        ))}
      </div>
    </div>
  )
}
