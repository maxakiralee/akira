import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const { token_hash, type } = router.query
      
      if (token_hash && type) {
        const supabase = createClient()
        
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token_hash as string,
          type: type as any,
        })
        
        if (error) {
          setError(error.message)
        } else {
          // Redirect to home page on success
          router.push('/')
        }
      }
      
      setLoading(false)
    }

    if (router.isReady) {
      handleEmailConfirmation()
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Confirming your email...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Confirmation Error</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return null
} 