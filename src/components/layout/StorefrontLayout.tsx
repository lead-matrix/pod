import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { LiveStoreEntrance } from '../storefront/LiveStoreEntrance'

export const StorefrontLayout: React.FC = () => {
  const [showEntrance, setShowEntrance] = useState(() => {
    return !sessionStorage.getItem('storefront_entered')
  })

  const handleEnterStore = (_audioEnabled: boolean) => {
    sessionStorage.setItem('storefront_entered', 'true')
    setShowEntrance(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#080808]">
      {/* Immersive entrance overlay (once per session) */}
      {showEntrance && <LiveStoreEntrance onEnter={handleEnterStore} />}

      <Header />

      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
