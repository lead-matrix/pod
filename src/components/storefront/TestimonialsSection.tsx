import React from 'react'

export const TestimonialsSection: React.FC = () => {
  const reviews = [
    {
      name: 'Alex R.',
      handle: '@alexr_street',
      quote: 'The print quality is insane. Colors are vibrant and the t-shirt weight feels extremely premium.',
      rating: 5,
    },
    {
      name: 'Marcus K.',
      handle: '@marcus_k',
      quote: 'Fulfillment was faster than expected! Got my hoodie in 4 days. Highly recommended.',
      rating: 5,
    },
    {
      name: 'Sarah P.',
      handle: '@sarahstyle',
      quote: 'Love the oversize fit. Will definitely be buying more drops.',
      rating: 5,
    },
  ]

  return (
    <section className="py-20 border-t border-white/[0.06] bg-[#07070c]/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Loved by the community</h2>
        <p className="text-gray-400 mt-2 max-w-xl mx-auto text-sm">Real reviews from our early drops.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {reviews.map((rev, idx) => (
            <div key={idx} className="glass-card p-6 text-left space-y-4">
              <div className="flex items-center gap-1 text-accent-400">
                {[...Array(rev.rating)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className="text-gray-300 text-sm italic">"{rev.quote}"</p>
              <div>
                <h4 className="text-white text-sm font-bold">{rev.name}</h4>
                <p className="text-xs text-gray-500">{rev.handle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
