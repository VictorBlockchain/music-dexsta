"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { AuthForm } from "@/components/auth-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ReviewersList } from "@/components/reviewers-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Music, Upload, FileAudio, ArrowRight, Star, Users, BookOpen, Sparkles } from "lucide-react"
import Link from "next/link"

interface User {
  username: string
  email: string
  id: string
}

export default function MusicSubmissionApp() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [activeTab, setActiveTab] = useState("reviewers")
  const supabase = createClient()

  useEffect(() => {
    // Immediate fallback - show auth form quickly if Supabase is slow
    const immediateFallback = setTimeout(() => {
      if (isLoading) {
        console.log('Immediate fallback triggered - showing auth form')
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
        console.log('Found cached user:', userData.email)
        setUser(userData)
        setIsLoading(false)
      } catch (error) {
        console.error('Error parsing cached user:', error)
        localStorage.removeItem('cached_user')
      }
    }

    // Check for OAuth errors in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    if (error) {
      console.error('OAuth error:', error)
      // Clear the error from URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Simplified auth check - just listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (event === "SIGNED_IN" && session?.user) {
        console.log('User signed in:', session.user.email)
        const userData = {
          id: session.user.id,
          email: session.user.email || "",
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || "User",
        }
        console.log('Setting user from auth state change:', userData)
        setUser(userData)
        // Cache user data for offline use
        localStorage.setItem('cached_user', JSON.stringify(userData))
        setIsLoading(false)
      } else if (event === "SIGNED_OUT") {
        console.log('User signed out')
        setUser(null)
        localStorage.removeItem('cached_user')
        setIsLoading(false)
      } else if (event === "INITIAL_SESSION") {
        // This event fires when the app loads and there's an existing session
        if (session?.user) {
          console.log('Found existing session on init:', session.user.email)
          const userData = {
            id: session.user.id,
            email: session.user.email || "",
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || "User",
          }
          setUser(userData)
          // Cache user data for offline use
          localStorage.setItem('cached_user', JSON.stringify(userData))
        }
        setIsLoading(false)
      }
    })

    // Final timeout as backup
    const timeout = setTimeout(() => {
      console.log('Final timeout reached, stopping loading')
      setIsLoading(false)
    }, 2000)

    return () => {
      clearTimeout(immediateFallback)
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleAuth = (userData: User) => {
    setUser(userData)
    // Cache user data for offline use
    localStorage.setItem('cached_user', JSON.stringify(userData))
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      setIsLoading(false) // Ensure loading state is cleared
    } catch (error) {
      console.error("Error signing out:", error)
      // Even if signout fails, clear the loading state
      setIsLoading(false)
      setUser(null)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isLoading) {
    return (
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
          <p className="text-purple-100/80 mb-6">Setting up your music review experience</p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl px-6 py-2 transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              {isLoggingOut ? "Signing Out..." : "Sign Out"}
            </Button>
            <Button 
              onClick={() => setIsLoading(false)}
              className="bg-purple-500/20 hover:bg-purple-500/30 text-white border border-purple-300/30 rounded-xl px-6 py-2 transition-all duration-300 hover:scale-105"
            >
              Skip Loading
            </Button>
          </div>
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
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance tracking-tight font-heading">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                  Music Review Hub
                </span>
              </h1>
              <p className="text-lg md:text-xl text-purple-100/80 text-balance max-w-2xl mx-auto leading-relaxed">
                music reviews to music nfts
              </p>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/10 backdrop-blur-xl border-0 p-2 rounded-3xl shadow-lg">
                <TabsTrigger
                  value="reviewers"
                  className="flex items-center justify-center gap-2 rounded-2xl text-purple-100/70 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] transition-all duration-300 hover:text-white hover:bg-white/20 font-medium py-4 px-6 text-sm"
                >
                  <Users className="w-4 h-4" />
                  <span>Reviewers</span>
                </TabsTrigger>
                <TabsTrigger
                  value="howto"
                  className="flex items-center justify-center gap-2 rounded-2xl text-purple-100/70 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] transition-all duration-300 hover:text-white hover:bg-white/20 font-medium py-4 px-6 text-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>How To</span>
                </TabsTrigger>
                <TabsTrigger
                  value="nfts"
                  className="flex items-center justify-center gap-2 rounded-2xl text-purple-100/70 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] transition-all duration-300 hover:text-white hover:bg-white/20 font-medium py-4 px-6 text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Music NFTs</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reviewers">
                <ReviewersList />
              </TabsContent>

              <TabsContent value="howto">
                <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl overflow-hidden">
                  <CardHeader className="px-8 pt-8 pb-6">
                    <CardTitle className="text-2xl font-bold text-center font-heading">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                        How to Submit Music
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 space-y-8">
                    {/* Step 1 */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          1
                        </div>
                        <h3 className="text-xl font-semibold text-purple-900">Choose a Reviewer</h3>
                      </div>
                      <p className="text-purple-700 leading-relaxed ml-16">
                        Browse active reviewers and find one whose style matches your music. Each reviewer has their own queue and pricing.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          2
                        </div>
                        <h3 className="text-xl font-semibold text-purple-900">Submit Your Track</h3>
                      </div>
                      <p className="text-purple-700 leading-relaxed ml-16">
                        Upload your MP3 file, add artwork, and provide details about your song including genre, story, and featuring artists.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          3
                        </div>
                        <h3 className="text-xl font-semibold text-purple-900">Get Reviewed</h3>
                      </div>
                      <p className="text-purple-700 leading-relaxed ml-16">
                        Wait for your review with ratings, feedback, and potential NFT creation. Track your submission in the queue.
                      </p>
                    </div>

                    {/* Call to Action */}
                    {/* <div className="pt-8 border-t border-purple-200/50">
                      <Link href="/review">
                        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-[1.02] py-4 text-lg">
                          <Music className="w-5 h-5 mr-2" />
                          Start Submitting Music
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                      <p className="text-sm text-purple-600/80 text-center mt-3">
                        Access all submission tools, track your queue, and manage your reviews
                      </p>
                    </div> */}

                    {/* Features */}
                    <div className="space-y-6 pt-8 border-t border-purple-200/50">
                      <h4 className="text-xl font-semibold text-purple-900 text-center">What You Get:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto">
                            <Star className="w-8 h-8 text-white" />
                          </div>
                          <h5 className="font-semibold text-purple-900">Professional Reviews</h5>
                          <p className="text-sm text-purple-700">Get detailed feedback and ratings from experienced music reviewers</p>
                        </div>
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                            <FileAudio className="w-8 h-8 text-white" />
                          </div>
                          <h5 className="font-semibold text-purple-900">Audio Support</h5>
                          <p className="text-sm text-purple-700">Upload MP3 files with artwork and detailed song information</p>
                        </div>
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto">
                            <Users className="w-8 h-8 text-white" />
                          </div>
                          <h5 className="font-semibold text-purple-900">Community</h5>
                          <p className="text-sm text-purple-700">Join a growing community of artists and music reviewers</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="nfts">
                <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl overflow-hidden">
                  <CardHeader className="px-8 pt-8 pb-6">
                    <CardTitle className="text-2xl font-bold text-center font-heading">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                        Music NFTs
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 space-y-8">
                    {/* Hero Message */}
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full flex items-center justify-center mx-auto">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-purple-900 font-heading">
                        The Future of Music is Music NFTs
                      </h2>
                      <p className="text-lg text-purple-700 leading-relaxed max-w-2xl mx-auto">
                        Join a community of web3 enthusiasts and collaborate with artists from around the world who are creating music NFTs!
                      </p>
                    </div>

                    {/* Discord CTA */}
                    <div className="pt-8 border-t border-purple-200/50">
                      <div className="text-center space-y-4">
                        <h3 className="text-xl font-semibold text-purple-900">Join the Dexsta Community</h3>
                        <p className="text-purple-700">
                          Connect with fellow artists, share your music, and discover the latest in music NFT technology
                        </p>
                        <a 
                          href="https://discord.gg/x5KYusDzMQ" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-[1.02] py-4 px-8 text-lg"
                        >
                          <Users className="w-5 h-5" />
                          Join Discord Community
                          <ArrowRight className="w-5 h-5" />
                        </a>
                        <p className="text-sm text-purple-600/80">
                          Connect with artists worldwide and explore the future of music
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-6 pt-8 border-t border-purple-200/50">
                      <h4 className="text-xl font-semibold text-purple-900 text-center">Why Music NFTs?</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto">
                            <Sparkles className="w-8 h-8 text-white" />
                          </div>
                          <h5 className="font-semibold text-purple-900">Web3 Innovation</h5>
                          <p className="text-sm text-purple-700">Be part of the cutting-edge technology revolutionizing music ownership and distribution</p>
                        </div>
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto">
                            <Users className="w-8 h-8 text-white" />
                          </div>
                          <h5 className="font-semibold text-purple-900">Global Collaboration</h5>
                          <p className="text-sm text-purple-700">Connect and collaborate with artists from around the world in the decentralized music ecosystem</p>
                        </div>
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                            <Music className="w-8 h-8 text-white" />
                          </div>
                          <h5 className="font-semibold text-purple-900">Own Your Music</h5>
                          <p className="text-sm text-purple-700">Take control of your music rights and monetization through blockchain technology</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>

          <Footer />
        </div>
      )
}
