import React, { useState, useEffect } from 'react'
import { Sparkles, MessageSquare, X, Send, User, ShoppingCart, UserCheck } from 'lucide-react'
import { Product } from '../../api/products'
import { useCart } from '../../hooks/useCart'
import toast from 'react-hot-toast'

interface LiveStylistProps {
  products: Product[]
  onOpenFittingRoom: () => void
  onOpenAIDesignLab: () => void
}

interface Message {
  sender: 'concierge' | 'user'
  text: string
  timestamp: string
  action?: {
    label: string
    onClick: () => void
    icon?: any
  }
}

// Simulated active viewer activities to create live social urgency
const SHOPPING_FEEDS = [
  { name: 'Lucas from London', action: 'added Cyberpunk T-Shirt to bag', time: '1m ago' },
  { name: 'Elena from Berlin', action: 'entered the 3D Fitting Room', time: '3m ago' },
  { name: 'Sophia from NY', action: 'generated Y2K Chrome art via AI', time: '5m ago' },
  { name: 'Marcus from Chicago', action: 'completed checkout ($148.00)', time: '8m ago' },
  { name: 'Chloe from Tokyo', action: 'unlocked FREE Shipping discount', time: '11m ago' }
]

export const LiveStylist: React.FC<LiveStylistProps> = ({ 
  products, 
  onOpenFittingRoom, 
  onOpenAIDesignLab 
}) => {
  const { addItem } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [unread, setUnread] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  
  // Real-time shopper feeds fluctuation
  const [currentFeed, setCurrentFeed] = useState(SHOPPING_FEEDS[0])

  useEffect(() => {
    // Initial welcome concierge greetings
    setMessages([
      {
        sender: 'concierge',
        text: 'Welcome to the ThreadDrop Live Flagship. I am Vesper, your virtual styling concierge. What look are we curating for you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])

    // Cycle shopping notifications ticker
    let feedIdx = 0
    const interval = setInterval(() => {
      feedIdx = (feedIdx + 1) % SHOPPING_FEEDS.length
      setCurrentFeed(SHOPPING_FEEDS[feedIdx])
      
      // Randomly notify shopper updates on user screen corner
      if (Math.random() > 0.6) {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-neutral-950/90 backdrop-blur-md border border-white/[0.08] shadow-glow rounded-xl pointer-events-none flex p-3.5 gap-3`}>
            <div className="flex-shrink-0 pt-0.5">
              <UserCheck className="h-5 w-5 text-brand-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Live Store Activity</p>
              <p className="text-[11px] text-gray-400 mt-1">
                <strong className="text-brand-300 font-semibold">{SHOPPING_FEEDS[feedIdx].name}</strong> {SHOPPING_FEEDS[feedIdx].action}
              </p>
            </div>
          </div>
        ), { duration: 3000, position: 'bottom-left' })
      }
    }, 9000)

    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) return

    const userMsgText = messageText
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    setMessages(prev => [...prev, {
      sender: 'user',
      text: userMsgText,
      timestamp: userTime
    }])
    
    setMessageText('')

    // Generate responsive concierge styled dialogue matches
    setTimeout(() => {
      let responseText = "I hear your vision. Let me recommend some high-fashion pieces that fit this aesthetic perfectly."
      let actionObj = undefined

      const promptLower = userMsgText.toLowerCase()
      if (promptLower.includes('cyber') || promptLower.includes('neon') || promptLower.includes('future')) {
        const match = products.find(p => p.name.toLowerCase().includes('cyber') || p.name.toLowerCase().includes('neon'))
        if (match) {
          responseText = `Excellent taste. The ${match.name} matches your futuristic theme. You can add it directly below, or load it in the fitting room mirror.`
          actionObj = {
            label: `Add ${match.name} to Bag`,
            onClick: () => {
              const variant = match.product_variants?.[0]
              addItem({
                variant_id: variant?.id || `stylist-${match.id}`,
                quantity: 1,
                product_name: match.name,
                variant_size: 'L',
                variant_color: variant?.color || 'Black',
                unit_price: Number(match.base_price || 40),
                image_url: match.thumbnail_url || '',
                printful_variant_id: variant?.printful_variant_id || 4001,
                printful_sync_variant_id: null,
                sku: 'STYLIST',
                product_slug: match.slug
              })
              toast.success(`${match.name} added to cart!`)
            }
          }
        } else {
          responseText = "I've locked in the Cyberpunk vibe. Try launching our AI Print Lab to build a personalized neon cyberpunk design from scratch!"
          actionObj = {
            label: "Open AI Design Lab",
            onClick: onOpenAIDesignLab
          }
        }
      } else if (promptLower.includes('fitting') || promptLower.includes('mirror') || promptLower.includes('wear') || promptLower.includes('try')) {
        responseText = "I'll open our 3D Live Mirror for you. Choose an avatar or upload your self photo to see how the pieces drape on the body."
        actionObj = {
          label: "Open Dressing Room",
          onClick: onOpenFittingRoom
        }
      } else if (promptLower.includes('design') || promptLower.includes('create') || promptLower.includes('custom') || promptLower.includes('ai')) {
        responseText = "Let's open the AI Design Lab. Type your concept prompt there, and our generative engine will build custom print mockups immediately."
        actionObj = {
          label: "Open AI Design Lab",
          onClick: onOpenAIDesignLab
        }
      }

      setMessages(prev => [...prev, {
        sender: 'concierge',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: actionObj
      }])
    }, 850)
  }

  const handleActionClick = (action: any) => {
    action.onClick()
  }

  return (
    <>
      {/* Floating Concierge Bubble Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Live notification ribbon */}
        {!isOpen && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/[0.08] text-[9px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none select-none shadow-glow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-500"></span>
            </span>
            <span>Vesper: Online</span>
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen)
            setUnread(false)
          }}
          className="relative h-14 w-14 rounded-full bg-brand-gradient hover:shadow-glow text-white flex items-center justify-center border border-white/20 hover:scale-105 active:scale-95 transition-all shadow-glow"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
          {unread && !isOpen && (
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-black animate-bounce" />
          )}
        </button>
      </div>

      {/* Concierge Dialog Panel Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 rounded-2xl bg-neutral-950 border border-white/10 shadow-glow flex flex-col overflow-hidden max-h-[500px]">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-white/[0.01] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-400" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Styling Concierge</h3>
                <span className="text-[9px] text-gray-500 font-medium">Assistant • Vesper</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[8px] font-mono text-brand-400 px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
              LIVE BROADCAST
            </div>
          </div>

          {/* Messages Scroll Box */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`h-8 w-8 rounded-full border flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'user' ? 'bg-white/5 border-white/10' : 'bg-brand-500/10 border-brand-500/30'
                }`}>
                  <User className={`h-4 w-4 ${msg.sender === 'user' ? 'text-gray-300' : 'text-brand-400'}`} />
                </div>
                
                <div className="space-y-1.5">
                  <div className={`rounded-xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-brand-500 text-white rounded-tr-none' 
                      : 'bg-white/[0.02] border border-white/[0.05] text-gray-300 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>

                  {/* Interactive Action curations */}
                  {msg.action && (
                    <button
                      onClick={() => handleActionClick(msg.action)}
                      className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 hover:bg-brand-500/20 text-[10px] font-bold text-brand-300 transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      <ShoppingCart className="h-3 w-3" />
                      <span>{msg.action.label}</span>
                    </button>
                  )}
                  
                  <span className="text-[8px] text-gray-600 block px-1">{msg.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Recommend Shortcuts */}
          <div className="px-4 py-2 border-t border-white/[0.04] bg-white/[0.01] flex gap-2 overflow-x-auto">
            <button
              onClick={() => {
                setMessageText('Show me cyber products')
                setTimeout(() => document.getElementById('chat-submit-btn')?.click(), 50)
              }}
              className="flex-shrink-0 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-bold text-gray-300 uppercase tracking-widest transition-colors"
            >
              Cyberwear Vibe
            </button>
            <button
              onClick={() => {
                setMessageText('Open dressing mirror')
                setTimeout(() => document.getElementById('chat-submit-btn')?.click(), 50)
              }}
              className="flex-shrink-0 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-bold text-gray-300 uppercase tracking-widest transition-colors"
            >
              Fitting Mirror
            </button>
            <button
              onClick={() => {
                setMessageText('Create print design')
                setTimeout(() => document.getElementById('chat-submit-btn')?.click(), 50)
              }}
              className="flex-shrink-0 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-bold text-gray-300 uppercase tracking-widest transition-colors"
            >
              AI Design Lab
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-black flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Ask styling recommendations..."
              className="flex-grow py-2 px-3.5 rounded-xl bg-surface-950 border border-white/[0.08] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              id="chat-submit-btn"
              className="p-2.5 rounded-xl bg-brand-gradient text-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center border border-white/10"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
