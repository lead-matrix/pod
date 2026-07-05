import React from 'react'
import { HeroSection } from '../../components/storefront/HeroSection'
import { ProductGrid } from '../../components/storefront/ProductGrid'
import { TestimonialsSection } from '../../components/storefront/TestimonialsSection'
import { useProducts } from '../../hooks/useProducts'

export const HomePage: React.FC = () => {
  const { data: products = [], isLoading } = useProducts({ featuredOnly: true })

  return (
    <div className="space-y-10 pb-20">
      <HeroSection />

      {/* Featured Products Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Featured Drops</h2>
            <p className="text-gray-400 mt-2 text-sm">Exclusive quality designs, limited production drops.</p>
          </div>
        </div>
        <ProductGrid products={products} loading={isLoading} />
      </section>

      <TestimonialsSection />
    </div>
  )
}
