"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Music, Twitter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AuthFormProps {
  onAuth: (user: { username: string; email: string; id: string }) => void
}

export function AuthForm({ onAuth }: AuthFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()


  const handleTwitterLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Attempting Twitter OAuth with redirect:', `${window.location.origin}/auth/callback`)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Supabase OAuth error:', error)
        console.error('Error details:', {
          message: error.message,
          status: error.status
        })
        throw error
      }

      console.log('OAuth redirect initiated:', data)
      // OAuth redirect will handle the rest
    } catch (error: unknown) {
      console.error('Twitter login error:', error)
      const errorMessage = error instanceof Error ? error.message : "Twitter login failed"
      
      // Check if it's a redirect URL issue
      if (errorMessage.includes('requested path is invalid') || errorMessage.includes('redirect_uri_mismatch')) {
        setError("❌ OAuth configuration issue. Please check: 1) Twitter is enabled in Supabase Dashboard 2) Callback URL is set correctly in Twitter app 3) Redirect URLs are configured in Supabase")
      } else {
        setError(`Twitter login failed: ${errorMessage}`)
      }
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center px-4">
      <div className="relative w-full max-w-md z-10">
        {/* Logo and Branding */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-8 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-3xl blur-xl opacity-70 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl w-full h-full flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform duration-300">
              <Music className="w-10 h-10 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight drop-shadow-lg font-heading">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
              dexsta
            </span>
          </h1>
          <p className="text-purple-100/80 text-lg mb-2">Music reviews with a smile!</p>
          <p className="text-purple-200/60 text-sm">Join creators, by creators</p>
        </div>

        {/* Twitter Login Only */}
        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-pink-100/80 backdrop-blur-sm border border-pink-300/50 rounded-2xl">
              <p className="text-pink-700 text-sm">{error}</p>
            </div>
          )}

          {/* Twitter/X Button */}
          <Button 
            onClick={handleTwitterLogin}
            disabled={isLoading}
            className="w-full h-14 bg-black hover:bg-gray-900 text-white font-semibold rounded-2xl shadow-xl hover:shadow-gray-500/20 transition-all duration-300 transform hover:scale-[1.02] group"
          >
            <Twitter className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
            {isLoading ? "Connecting..." : "Continue with X (Twitter)"}
          </Button>
          
          <p className="text-xs text-purple-200/60 text-center mt-4">
            Sign in with your Twitter account to get started
          </p>
        </div>
      </div>
    </div>
  )
}
