"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubmissionForm } from "@/components/submission-form"
import { QueueList } from "@/components/queue-list"
import { HistoryList } from "@/components/history-list"
import { SettingsPanel } from "@/components/settings-panel"
import { AuthForm } from "@/components/auth-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Music, Quote as Queue, History, Settings, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface User {
  username: string
  email: string
  id: string
}

function ReviewPageContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || "form")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Immediate fallback - show auth form quickly if Supabase is slow
    const immediateFallback = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false)
      }
    }, 1500) // Reduced to 1.5 seconds

    // Check if user is offline
    if (!navigator.onLine) {
      console.log('User is offline - showing auth form')
      setIsLoading(false)
    }
    
    // Check localStorage for cached user data (fallback)
    const cachedUser = localStorage.getItem('cached_user')
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser)
        setUser(userData)
        setIsLoading(false)
        return
      } catch (e) {
        console.error("Error parsing cached user:", e)
      }
    }

    // Check auth state
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          const userData = {
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            id: session.user.id
          }
          setUser(userData)
          // Cache user data
          localStorage.setItem('cached_user', JSON.stringify(userData))
        } else {
          console.log('No active session')
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // console.log('Auth state changed:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = {
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          id: session.user.id
        }
        setUser(userData)
        localStorage.setItem('cached_user', JSON.stringify(userData))
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        localStorage.removeItem('cached_user')
      }
      
      setIsLoading(false)
    })

    return () => {
      clearTimeout(immediateFallback)
      subscription.unsubscribe()
    }
  }, [supabase.auth, isLoading])

  const handleAuth = (userData: User) => {
    setUser(userData)
    localStorage.setItem('cached_user', JSON.stringify(userData))
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      localStorage.removeItem('cached_user')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-200 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onAuth={handleAuth} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col">
      <Header user={user} onLogout={handleLogout} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back to Home */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reviewers
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance tracking-tight font-heading">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
              Music Review Center
            </span>
          </h1>
          <p className="text-lg md:text-xl text-purple-100/80 text-balance max-w-2xl mx-auto leading-relaxed">
            Submit your music, track your queue, and manage your reviews
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/10 backdrop-blur-xl border-0 p-2 rounded-3xl shadow-lg">
            <TabsTrigger
              value="form"
              className="flex items-center justify-center gap-2 rounded-2xl text-purple-100/70 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] transition-all duration-300 hover:text-white hover:bg-white/20 font-medium py-4 px-6 text-sm"
            >
              <Music className="w-4 h-4" />
              <span className="hidden sm:inline">Submit</span>
            </TabsTrigger>
            <TabsTrigger
              value="queue"
              className="flex items-center justify-center gap-2 rounded-2xl text-purple-100/70 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] transition-all duration-300 hover:text-white hover:bg-white/20 font-medium py-4 px-6 text-sm"
            >
              <Queue className="w-4 h-4" />
              <span className="hidden sm:inline">Queue</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center justify-center gap-2 rounded-2xl text-purple-100/70 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] transition-all duration-300 hover:text-white hover:bg-white/20 font-medium py-4 px-6 text-sm"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center justify-center gap-2 rounded-2xl text-purple-100/70 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] transition-all duration-300 hover:text-white hover:bg-white/20 font-medium py-4 px-6 text-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <SubmissionForm onSubmit={() => setActiveTab("queue")} user={user} />
          </TabsContent>

          <TabsContent value="queue">
            <QueueList user={user} />
          </TabsContent>

          <TabsContent value="history">
            <HistoryList reviewerId={user?.id} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel user={user} />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-3xl blur-xl opacity-70 animate-pulse"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl w-full h-full flex items-center justify-center shadow-2xl">
              <Music className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-3 tracking-tight font-heading">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
              Loading...
            </span>
          </h1>
          <p className="text-purple-100/80">Setting up your review experience</p>
        </div>
      </div>
    }>
      <ReviewPageContent />
    </Suspense>
  )
}
