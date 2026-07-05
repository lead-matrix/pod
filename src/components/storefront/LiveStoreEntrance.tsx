import React, { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, LogIn, Sparkles, Users } from 'lucide-react'

// Web Audio API ambient synthesizer for premium store soundscape
class StoreAmbientSynth {
  private ctx: AudioContext | null = null
  private oscs: OscillatorNode[] = []
  private gain: GainNode | null = null
  private filter: BiquadFilterNode | null = null
  private isPlaying = false

  start() {
    if (this.isPlaying) return
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.gain = this.ctx.createGain()
      this.filter = this.ctx.createBiquadFilter()

      // Lowpass filter for smooth, deep ambient vibe
      this.filter.type = 'lowpass'
      this.filter.frequency.setValueAtTime(320, this.ctx.currentTime)

      this.gain.gain.setValueAtTime(0, this.ctx.currentTime)
      this.gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 3)

      this.filter.connect(this.gain)
      this.gain.connect(this.ctx.destination)

      // Cozy major 7th chord (F major 7: F3, A3, C4, E4)
      const freqs = [174.61, 220.00, 261.63, 329.63]
      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.filter) return
        const osc = this.ctx.createOscillator()
        const oscGain = this.ctx.createGain()

        osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle'
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime)

        // Slow pitch drift for tape-like warm analog feel
        const lfo = this.ctx.createOscillator()
        const lfoGain = this.ctx.createGain()
        lfo.frequency.setValueAtTime(0.15 + idx * 0.05, this.ctx.currentTime)
        lfoGain.gain.setValueAtTime(1.5, this.ctx.currentTime)
        lfo.connect(lfoGain)
        lfoGain.connect(osc.frequency)

        oscGain.gain.setValueAtTime(0.04, this.ctx.currentTime)
        osc.connect(oscGain)
        oscGain.connect(this.filter)

        lfo.start()
        osc.start()
        this.oscs.push(osc)
      })

      this.isPlaying = true
    } catch (e) {
      console.warn('AudioContext failed to start', e)
    }
  }

  stop() {
    if (!this.isPlaying) return
    if (this.gain && this.ctx) {
      this.gain.gain.setValueAtTime(this.gain.gain.value, this.ctx.currentTime)
      this.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5)
      setTimeout(() => {
        try {
          this.oscs.forEach(osc => osc.stop())
          this.oscs = []
          this.ctx?.close()
          this.ctx = null
        } catch (err) {}
      }, 1500)
    }
    this.isPlaying = false
  }

  playDoorOpen() {
    if (!this.ctx) return
    try {
      const openGain = this.ctx.createGain()
      const noise = this.ctx.createOscillator()
      const filter = this.ctx.createBiquadFilter()

      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(150, this.ctx.currentTime)
      filter.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.8)

      noise.type = 'triangle'
      noise.frequency.setValueAtTime(120, this.ctx.currentTime)
      noise.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.8)

      openGain.gain.setValueAtTime(0.15, this.ctx.currentTime)
      openGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8)

      noise.connect(filter)
      filter.connect(openGain)
      openGain.connect(this.ctx.destination)

      noise.start()
      noise.stop(this.ctx.currentTime + 0.8)
    } catch (e) {}
  }
}

interface LiveStoreEntranceProps {
  onEnter: (audioEnabled: boolean) => void
}

export const LiveStoreEntrance: React.FC<LiveStoreEntranceProps> = ({ onEnter }) => {
  const [hasEntered, setHasEntered] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [visitors, setVisitors] = useState(42)
  const [entranceState, setEntranceState] = useState<'doors-closed' | 'opening' | 'entered'>('doors-closed')
  const synthRef = useRef<StoreAmbientSynth | null>(null)

  useEffect(() => {
    synthRef.current = new StoreAmbientSynth()
    // Simulated visitors fluctuating
    const interval = setInterval(() => {
      setVisitors(v => Math.max(30, Math.min(65, v + (Math.random() > 0.5 ? 1 : -1))))
    }, 4000)

    return () => {
      clearInterval(interval)
      synthRef.current?.stop()
    }
  }, [])

  const handleStartMusic = () => {
    if (audioEnabled) {
      synthRef.current?.start()
    } else {
      synthRef.current?.stop()
    }
  }

  const handleToggleAudio = () => {
    const nextVal = !audioEnabled
    setAudioEnabled(nextVal)
    if (synthRef.current) {
      if (nextVal) {
        synthRef.current.start()
      } else {
        synthRef.current.stop()
      }
    }
  }

  const handleEnterStore = () => {
    if (entranceState !== 'doors-closed') return

    // Play physical glass slide/air sound
    if (audioEnabled && synthRef.current) {
      synthRef.current.playDoorOpen()
    }

    setEntranceState('opening')

    setTimeout(() => {
      setEntranceState('entered')
      onEnter(audioEnabled)
    }, 1200)
  }

  if (entranceState === 'entered') return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black">
      {/* Immersive Storefront Glass Door Visualizer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black" />

      {/* Decorative vertical glowing line grid */}
      <div className="absolute inset-0 flex justify-between px-12 opacity-10 pointer-events-none">
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-brand-500 to-transparent" />
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-brand-500 to-transparent" />
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-brand-500 to-transparent" />
      </div>

      {/* Interactive Sliding Doors */}
      <div
        className={`absolute inset-y-0 left-0 w-1/2 border-r border-white/10 bg-neutral-950/80 backdrop-blur-2xl transition-transform duration-1000 ease-out flex items-center justify-end pr-8 ${
          entranceState === 'opening' ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        {/* Left reflection line */}
        <div className="absolute inset-y-0 right-1 w-[2px] bg-gradient-to-b from-white/0 via-white/20 to-white/0" />
      </div>

      <div
        className={`absolute inset-y-0 right-0 w-1/2 border-l border-white/10 bg-neutral-950/80 backdrop-blur-2xl transition-transform duration-1000 ease-out flex items-center justify-start pl-8 ${
          entranceState === 'opening' ? 'translate-x-full' : 'translate-x-0'
        }`}
      >
        {/* Right reflection line */}
        <div className="absolute inset-y-0 left-1 w-[2px] bg-gradient-to-b from-white/0 via-white/20 to-white/0" />
      </div>

      {/* Storefront Sign & CTAs Container */}
      <div
        className={`relative z-10 flex flex-col items-center max-w-lg text-center px-6 transition-all duration-700 ${
          entranceState === 'opening' ? 'scale-110 opacity-0 blur-md' : 'scale-100 opacity-100'
        }`}
      >
        {/* Live status badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-xs font-semibold text-brand-300 tracking-wider uppercase mb-6 animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          Live Flagship Showroom
        </div>

        {/* Dynamic Brand Logo Headline */}
        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-100 to-neutral-400 tracking-tighter uppercase select-none">
          ThreadDrop
        </h1>
        <div className="h-[2px] w-24 bg-brand-gradient my-4" />
        <p className="text-gray-400 text-sm md:text-base max-w-sm tracking-wide leading-relaxed">
          Step into our immersive live catalog. Custom AI print lab, real-time runway models, and 3D mirror dressing.
        </p>

        {/* Quick status feed */}
        <div className="mt-8 mb-8 flex items-center gap-6 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-brand-400" />
            <span><strong className="text-white">{visitors}</strong> inside store</span>
          </div>
          <div className="h-3 w-[1px] bg-white/10" />
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-brand-400" />
            <span>AI Design Engine online</span>
          </div>
        </div>

        {/* Entrance trigger buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <button
            onClick={handleEnterStore}
            className="w-full relative group overflow-hidden px-8 py-4 rounded-xl font-bold text-white bg-brand-gradient shadow-glow hover:shadow-glow-md transition-all duration-300 flex items-center justify-center gap-2.5 text-sm uppercase tracking-wider border border-white/20 active:scale-95"
          >
            <LogIn className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            <span>Enter Flagship Store</span>
          </button>

          <button
            onClick={handleToggleAudio}
            className="w-full sm:w-auto px-6 py-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-xs font-semibold text-gray-300 flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            {audioEnabled ? (
              <>
                <Volume2 className="h-4 w-4 text-brand-400" />
                <span>Audio: Live Beat</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 text-gray-500" />
                <span>Audio: Muted</span>
              </>
            )}
          </button>
        </div>

        {/* Ambient background beats trigger note */}
        <p className="text-[10px] text-gray-600 mt-4 font-medium uppercase tracking-widest">
          Autoplay beats require permission • Click audio button to toggle
        </p>
      </div>
    </div>
  )
}
