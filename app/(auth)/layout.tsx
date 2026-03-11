export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-gray-900 p-12 text-white">
        <div>
          <h1 className="text-2xl font-bold">Energy Day Designer</h1>
          <p className="text-gray-400 mt-1 text-sm">Plan with your actual capacity</p>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            {[
              { emoji: '🟢', title: 'Green day', desc: 'High capacity — deep work, big tasks, creative sessions' },
              { emoji: '🟡', title: 'Yellow day', desc: 'Medium capacity — moderate blocks, realistic goals' },
              { emoji: '🔴', title: 'Red day', desc: 'Low capacity — gentle tasks only. Rest is productive.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="flex gap-4 items-start">
                <span className="text-2xl">{emoji}</span>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="text-sm text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <blockquote className="border-l-2 border-gray-600 pl-4 text-gray-300 text-sm italic">
            "Plan for how you actually feel, not how you think you should feel."
          </blockquote>
        </div>

        <p className="text-xs text-gray-600">
          Grounded in Spoon Theory, energy management research, and ACT.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile-only title */}
          <div className="md:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Energy Day Designer</h1>
            <p className="text-sm text-gray-500 mt-1">Plan with your actual capacity</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
