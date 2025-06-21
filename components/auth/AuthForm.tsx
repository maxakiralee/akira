import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

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
    <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 w-full max-w-md">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/20 focus:border-white/40 focus:outline-none"
          />
        </div>
        
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/20 focus:border-white/40 focus:outline-none"
          />
        </div>
        
        {error && (
          <div className="text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        
        {message && (
          <div className="text-green-400 text-sm text-center">
            {message}
          </div>
        )}
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/20"
        >
          {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-white/80 hover:text-white text-sm underline"
        >
          {isLogin ? "Don&apos;t have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  )
} 