import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuthFormProps {
  onAuthSuccess?: () => void
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        console.log('Sign in successful')
        onAuthSuccess?.()
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        
        // Handle specific signup errors
        if (error) {
          if (error.message.includes('User already registered')) {
            setError('User already exists. Please sign in instead.')
            setIsLogin(true) // Switch to login mode
            return
          }
          throw error
        }
        
        console.log('Sign up successful')
        
        // If email confirmations are enabled, show success message
        if (data.user && !data.session) {
          setMessage("Please check your email and click the confirmation link to complete your signup.")
          return
        }
        
        // If we have a session, signup was successful
        if (data.session) {
          console.log('Signup successful with session')
          
          // Automatically create Letta agent for new user
          try {
            setMessage("Creating your AI companion...")
            console.log('Creating agent for new user')
            
            const agentResponse = await fetch('/api/createAssistant', {
              method: 'POST',
            })
            
            console.log('Agent creation response status:', agentResponse.status)
            
            if (agentResponse.ok) {
              const agent = await agentResponse.json()
              console.log('Agent created successfully')
              setMessage("Welcome! Your AI companion Akira is ready.")
            } else {
              const errorData = await agentResponse.json()
              console.error('Failed to create agent:', {
                status: agentResponse.status,
                message: errorData.message
              })
              setError(`Account created but failed to set up AI companion: ${errorData.message || 'Unknown error'}`)
            }
          } catch (agentError) {
            console.error('Error creating agent')
            setError('Account created but failed to set up AI companion. You can create one manually.')
          }
          
          // Small delay to show the success message before calling onAuthSuccess
          setTimeout(() => {
            onAuthSuccess?.()
          }, 1500)
        }
      }
    } catch (error: any) {
      console.error('Auth error')
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Main Auth Card */}
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl p-8 shadow-[20px_20px_40px_rgba(0,0,0,0.1),-20px_-20px_40px_rgba(255,255,255,0.8)] border border-white/50">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-light text-slate-700 mb-2">
            {isLogin ? 'Welcome Back' : 'Join'}
          </h2>
          <p className="text-sm text-slate-500">
            {isLogin ? 'Sign in to continue' : 'Create your account'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-6 py-4 rounded-2xl bg-slate-100 text-slate-700 placeholder-slate-400 border-0 shadow-[inset_8px_8px_16px_rgba(0,0,0,0.1),inset_-8px_-8px_16px_rgba(255,255,255,0.8)] focus:outline-none"
            />
          </div>
          
          {/* Password Input */}
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-6 py-4 rounded-2xl bg-slate-100 text-slate-700 placeholder-slate-400 border-0 shadow-[inset_8px_8px_16px_rgba(0,0,0,0.1),inset_-8px_-8px_16px_rgba(255,255,255,0.8)] focus:outline-none"
            />
          </div>
          
          {/* Error/Success Messages */}
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 py-3 px-4 rounded-xl shadow-[inset_4px_4px_8px_rgba(239,68,68,0.1)]">
              {error}
            </div>
          )}
          
          {message && (
            <div className="text-emerald-600 text-sm text-center bg-emerald-50 py-3 px-4 rounded-xl shadow-[inset_4px_4px_8px_rgba(16,185,129,0.1)]">
              {message}
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-500 text-white font-medium shadow-[8px_8px_16px_rgba(0,0,0,0.15),-8px_-8px_16px_rgba(255,255,255,0.1)] hover:shadow-[12px_12px_20px_rgba(0,0,0,0.2),-12px_-12px_20px_rgba(255,255,255,0.15)] active:shadow-[inset_8px_8px_16px_rgba(0,0,0,0.2)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>
        
        {/* Toggle Auth Mode */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-500 hover:text-slate-700 text-sm transition-colors duration-200"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  )
} 