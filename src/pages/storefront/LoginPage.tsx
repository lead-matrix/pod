import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Loader2, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [signUpDone, setSignUpDone] = useState(false)
  const navigate = useNavigate()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName || null },
          },
        })
        if (error) throw error

        // Supabase returns a session immediately when email confirmation is disabled.
        // If a session exists, log them straight in; otherwise show the email prompt.
        if (data.session) {
          toast.success('Account created — welcome to ThreadDrop! 🎉')
          navigate('/account')
        } else {
          // Email confirmation is enabled — show a success state
          setSignUpDone(true)
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Welcome back!')
        navigate('/account')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed'
      // Make common Supabase errors friendlier
      if (msg.includes('Invalid login credentials')) {
        toast.error('Incorrect email or password. Please try again.')
      } else if (msg.includes('Email not confirmed')) {
        toast.error('Please confirm your email address first.')
      } else if (msg.includes('User already registered')) {
        toast.error('An account with this email already exists. Sign in instead.')
        setIsSignUp(false)
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Sign-up email confirmation screen ───────────────────────
  if (signUpDone) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md glass-card p-10 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-brand-500/20 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-brand-400" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Check your inbox</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            We sent a confirmation link to{' '}
            <span className="text-brand-400 font-semibold">{email}</span>.<br />
            Click the link to activate your account, then sign in below.
          </p>
          <button
            onClick={() => { setSignUpDone(false); setIsSignUp(false) }}
            className="glass-button-primary w-full flex items-center justify-center gap-2"
          >
            Go to Sign In <ArrowRight className="h-4 w-4" />
          </button>
          <p className="text-xs text-gray-600">
            Didn't get it? Check your spam folder or{' '}
            <button
              onClick={() => setSignUpDone(false)}
              className="text-brand-400 hover:underline"
            >
              try again
            </button>
            .
          </p>
        </div>
      </div>
    )
  }

  // ── Main sign-in / sign-up form ──────────────────────────────
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-card p-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="text-2xl font-black tracking-tighter text-white">
            Thread<span className="text-brand-400">Drop</span>
          </Link>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-white">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setSignUpDone(false) }}
              className="font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-4" onSubmit={handleAuth}>
          {/* Full name — sign up only */}
          {isSignUp && (
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Full name (optional)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="glass-input !pl-10 w-full"
                autoComplete="name"
              />
            </div>
          )}

          {/* Email */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
              <Mail className="h-4 w-4" />
            </span>
            <input
              id="email"
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input !pl-10 w-full"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              placeholder={isSignUp ? 'Password (min 6 characters)' : 'Password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input !pl-10 w-full"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>

          {/* Forgot password — sign in only */}
          {!isSignUp && (
            <div className="text-right">
              <button
                type="button"
                onClick={async () => {
                  if (!email) { toast.error('Enter your email first'); return }
                  const { error } = await supabase.auth.resetPasswordForEmail(email)
                  if (error) toast.error(error.message)
                  else toast.success('Password reset email sent!')
                }}
                className="text-xs text-gray-500 hover:text-brand-400 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            id="auth-submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-brand-gradient hover:opacity-95 shadow-glow transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isSignUp ? (
              <>Create Account <ArrowRight className="h-4 w-4" /></>
            ) : (
              <>Sign In <ArrowRight className="h-4 w-4" /></>
            )}
          </button>

          {/* Demo Bypass Options for Immediate Experience */}
          <div className="pt-4 border-t border-white/[0.06] space-y-3">
            <div className="text-center">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                Fast Experience Demo Mode
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  useAuthStore.getState().signInDemo('customer')
                  toast.success('Signed in as Demo Customer!')
                  navigate('/account')
                }}
                className="flex items-center justify-center py-2 px-3 rounded-lg text-xs font-semibold text-gray-300 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:text-white transition-all"
              >
                Demo Customer
              </button>
              <button
                type="button"
                onClick={() => {
                  useAuthStore.getState().signInDemo('admin')
                  toast.success('Signed in as Demo Admin!')
                  navigate('/admin')
                }}
                className="flex items-center justify-center py-2 px-3 rounded-lg text-xs font-semibold text-brand-400 bg-brand-500/10 border border-brand-500/20 hover:bg-brand-500/20 hover:text-brand-300 transition-all"
              >
                Demo Admin
              </button>
            </div>
          </div>

          {isSignUp && (
            <p className="text-center text-xs text-gray-600">
              By signing up you agree to our{' '}
              <span className="text-gray-500">Terms of Service</span> and{' '}
              <span className="text-gray-500">Privacy Policy</span>.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
