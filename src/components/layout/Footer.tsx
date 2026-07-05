import React from 'react'
import { Link } from 'react-router-dom'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/[0.06] bg-[#06060a] py-12 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight">ThreadDrop</h3>
            <p className="text-sm">Premium print-on-demand streetwear designed to make a statement. Automatic global fulfillment.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop?category=t-shirts" className="hover:text-white transition-colors">T-Shirts</Link></li>
              <li><Link to="/shop?category=hoodies" className="hover:text-white transition-colors">Hoodies</Link></li>
              <li><Link to="/shop?category=hats" className="hover:text-white transition-colors">Hats</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Customer Info</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shipping-info" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/[0.06] pt-8 text-center text-xs">
          <p>&copy; {currentYear} ThreadDrop. All rights reserved. Automated by Printful & Stripe.</p>
        </div>
      </div>
    </footer>
  )
}
