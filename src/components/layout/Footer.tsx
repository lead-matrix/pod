import React from 'react'
import { Link } from 'react-router-dom'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/[0.06] bg-[#080808] py-12 text-gray-500 font-mono-label text-[11px] uppercase tracking-wider">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4 font-sans normal-case tracking-normal">
            <h3 className="text-lg font-bold text-white tracking-tight font-display">LMTRX</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Premium designer print streetwear. Hand-crafted aesthetics with automated global fulfillment.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><Link to="/shop?category=tees" className="hover:text-white transition-colors">Tees</Link></li>
              <li><Link to="/shop?category=hoodies" className="hover:text-white transition-colors">Hoodies</Link></li>
              <li><Link to="/shop?category=caps" className="hover:text-white transition-colors">Caps</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Customer Info</h4>
            <ul className="space-y-2">
              <li><Link to="/shipping-info" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/[0.06] pt-8 text-center text-[10px] text-gray-600">
          <p>&copy; {currentYear} LMTRX. All rights reserved. Automated by Printful & Stripe.</p>
        </div>
      </div>
    </footer>
  )
}
