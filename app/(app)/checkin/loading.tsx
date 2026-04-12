export default function CheckinLoading() {
  return (
    <div className="max-w-md mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-40 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-56 mb-8" />
      <div className="space-y-6">
        {[0, 1, 2].map(i => (
          <div key={i} className="bg-gray-100 rounded-xl p-5 h-28" />
        ))}
      </div>
      <div className="mt-6 bg-gray-100 rounded-xl h-24" />
      <div className="mt-6 bg-gray-200 rounded-xl h-12" />
    </div>
  )
}
