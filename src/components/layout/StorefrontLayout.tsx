import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { LiveStoreEntrance } from '../storefront/LiveStoreEntrance'
import { AIDesignLab } from '../storefront/AIDesignLab'
import { LiveFittingRoom } from '../storefront/LiveFittingRoom'
import { LiveStylist } from '../storefront/LiveStylist'
import { useProducts } from '../../hooks/useProducts'

export const StorefrontLayout: React.FC = () => {
  const { data: products = [] } = useProducts()
  
  // Immersive Entrance screen state (per-session tracking)
  const [showEntrance, setShowEntrance] = useState(() => {
    return !sessionStorage.getItem('storefront_entered')
  })

  const [isFittingOpen, setIsFittingOpen] = useState(false)
  const [isAIDesignOpen, setIsAIDesignOpen] = useState(false)

  useEffect(() => {
    const handleOpenFitting = () => setIsFittingOpen(true)
    const handleOpenAI = () => setIsAIDesignOpen(true)

    window.addEventListener('open-fitting-room', handleOpenFitting)
    window.addEventListener('open-ai-design-lab', handleOpenAI)

    return () => {
      window.removeEventListener('open-fitting-room', handleOpenFitting)
      window.removeEventListener('open-ai-design-lab', handleOpenAI)
    }
  }, [])

  const handleEnterStore = (audioEnabled: boolean) => {
    sessionStorage.setItem('storefront_entered', 'true')
    setShowEntrance(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-hero-gradient">
      {/* Immersive Store Entrance Overlay */}
      {showEntrance && <LiveStoreEntrance onEnter={handleEnterStore} />}

      <Header />
      
      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />

      {/* Live shopping portals */}
      <AIDesignLab 
        isOpen={isAIDesignOpen} 
        onClose={() => setIsAIDesignOpen(false)} 
      />

      <LiveFittingRoom 
        isOpen={isFittingOpen} 
        onClose={() => setIsFittingOpen(false)} 
        products={products}
      />

      <LiveStylist 
        products={products}
        onOpenFittingRoom={() => setIsFittingOpen(true)}
        onOpenAIDesignLab={() => setIsAIDesignOpen(false)}
      />
    </div>
  )
}
