"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Footer } from "@/components/footer"
import { SubmissionForm } from "@/components/submission-form"
import { QueueList } from "@/components/queue-list"
import { HistoryList } from "@/components/history-list"
import { SettingsPanel } from "@/components/settings-panel"
import { Music, Users, Clock, Star, DollarSign, ExternalLink, Zap, ArrowLeft, AlertCircle, Coins, Quote as Queue, History, Settings } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Reviewer {
  id: string
  username: string
  email: string
  tiktokHandle: string
  reviewerName: string
  reviewerUrl: string
  isOnline: boolean
  queueLength: number
  reviewsCompleted: number
  skipLinePriceUsd: number
  skipLinePriceSei: number
  freeSkips: number
  averageRating: number
  lastActive: string
  profileImage?: string
  bio?: string
  cashapp?: string
  applePay?: string
  seiWallet?: string
  dexstaProfile?: string
  spotifyProfile?: string
  soundcloudProfile?: string
  youtubeProfile?: string
}

interface User {
  username: string
  email: string
  id: string
}

export default function ReviewerPage() {
  const params = useParams()
  const reviewerHandle = params.reviewer as string
  const [reviewer, setReviewer] = useState<Reviewer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("form")
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadReviewer = async () => {
      try {
        console.log(`Looking for reviewer with handle: ${reviewerHandle}`)
        
        // First, let's check if any profile exists with this TikTok handle
        const { data: allProfiles, error: allProfilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('tiktok_handle', reviewerHandle)
          .maybeSingle()
            console.log('All profiles with this handle:', allProfiles)
        
        if (allProfilesError) {
          console.error('Error checking profiles:', allProfilesError)
          setError("Database error occurred")
          setLoading(false)
          return
        }

        if (!allProfiles) {
          console.log('No profile found with this TikTok handle')
          setError(`No profile found with TikTok handle @${reviewerHandle}`)
          setLoading(false)
          return
        }

        // Use the profile found (even if not a reviewer yet)
        const reviewerProfile = allProfiles
        const isReviewerActive = reviewerProfile.is_reviewer === true
        
        console.log('Profile found:', reviewerProfile)
        console.log('Reviewer mode active:', isReviewerActive)

        console.log('Found reviewer profile:', reviewerProfile)

        // Load queue length and reviews completed
        const { data: queueData } = await supabase
          .from('submissions')
          .select('id')
          .eq('status', 'pending')

        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('id')
          .eq('reviewer_id', reviewerProfile.id)

        const queueLength = queueData?.length || 0
        const reviewsCompleted = reviewsData?.length || 0

        const reviewer: Reviewer = {
          id: reviewerProfile.id,
          username: reviewerProfile.username,
          email: reviewerProfile.email,
          tiktokHandle: reviewerProfile.tiktok_handle || '',
          reviewerName: reviewerProfile.tiktok_handle || reviewerProfile.username,
          reviewerUrl: reviewerProfile.reviewer_url || reviewerProfile.tiktok_handle?.replace('@', '') || '',
          isOnline: isReviewerActive,
          queueLength: isReviewerActive ? queueLength : 0,
          reviewsCompleted: isReviewerActive ? reviewsCompleted : 0,
          skipLinePriceUsd: reviewerProfile.skip_price_usd || 0,
          skipLinePriceSei: reviewerProfile.skip_price_sei || 0,
          freeSkips: reviewerProfile.free_skips || 0,
          averageRating: 4.2, // Mock data
          lastActive: new Date().toISOString(),
          profileImage: reviewerProfile.profile_image_url,
          bio: reviewerProfile.bio,
          cashapp: reviewerProfile.cashapp,
          applePay: reviewerProfile.apple_pay,
          seiWallet: reviewerProfile.sei_wallet,
          dexstaProfile: reviewerProfile.dexsta_profile,
          spotifyProfile: reviewerProfile.spotify_profile,
          soundcloudProfile: reviewerProfile.soundcloud_profile,
          youtubeProfile: reviewerProfile.youtube_profile,
        }

        setReviewer(reviewer)
      } catch (error) {
        console.error("Error loading reviewer:", error)
        setError("Failed to load reviewer")
      } finally {
        setLoading(false)
      }
    }

    loadReviewer()
  }, [reviewerHandle, supabase])

  // Load current user data
  useEffect(() => {
    const loadCurrentUser = () => {
      try {
        const cachedUser = localStorage.getItem('cached_user')
        if (cachedUser) {
          const userData = JSON.parse(cachedUser)
          setUser(userData)
        }
      } catch (error) {
        console.error('Error loading current user:', error)
      }
    }

    loadCurrentUser()
  }, [])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  const timeAgo = (dateString: string) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffMs = now.getTime() - past.getTime()
    const diffMinutes = Math.round(diffMs / (1000 * 60))
    const diffHours = Math.round(diffMs / (1000 * 60 * 60))
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
            <Music className="w-8 h-8 text-white" />
          </div>
          <p className="text-white text-lg">Loading reviewer...</p>
        </div>
      </div>
    )
  }

  if (error || !reviewer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4 font-heading">Reviewer Not Found</h1>
          <p className="text-purple-100/80 mb-6">
            The reviewer "{reviewerHandle}" could not be found or is not currently active.
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-xl blur-md opacity-70 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl w-full h-full flex items-center justify-center shadow-md">
                <Music className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight font-heading hidden sm:block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                dexsta
              </span>
            </h1>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100 rounded-xl text-sm sm:text-base">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Reviewer Profile Card */}
        <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl overflow-hidden mb-8">
          <CardContent className="p-4 sm:p-8">
            {/* Mobile-first layout */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Profile Image - Better mobile sizing */}
              <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                <Avatar className="h-28 w-28 sm:h-24 sm:w-24 border-4 border-purple-400">
                  {reviewer.profileImage ? (
                    <img src={reviewer.profileImage} alt={reviewer.tiktokHandle} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-2xl">
                      {getInitials(reviewer.tiktokHandle || reviewer.username)}
                    </AvatarFallback>
                  )}
                </Avatar>
                {/* Online Status Indicator */}
                <span
                  className={`absolute bottom-0 right-0 block h-6 w-6 rounded-full ring-4 ring-white ${
                    reviewer.isOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></span>
              </div>

              {/* Reviewer Info */}
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-heading text-purple-900 mb-2">
                    @{reviewer.tiktokHandle}
                  </h1>
                  <p className="text-purple-600/80 text-base sm:text-lg flex items-center justify-center sm:justify-start gap-2">
                    <Music className="w-4 h-4 sm:w-5 sm:h-5" />
                    music.dexsta.fun/{reviewer.reviewerUrl}
                  </p>
                  {reviewer.bio && (
                    <p className="text-purple-700 mt-3 leading-relaxed">
                      {reviewer.bio}
                    </p>
                  )}
                </div>

                {/* Stats Grid - Better mobile layout */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
                  <div className="text-center p-2 sm:p-3 bg-purple-50/80 rounded-lg sm:rounded-xl">
                    <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-purple-500 mx-auto mb-1" />
                    <p className="text-xs sm:text-sm text-purple-600/80">Queue</p>
                    <p className="text-sm sm:text-xl font-bold text-purple-900">{reviewer.queueLength}</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-purple-50/80 rounded-lg sm:rounded-xl">
                    <Star className="w-4 h-4 sm:w-6 sm:h-6 text-amber-500 mx-auto mb-1" />
                    <p className="text-xs sm:text-sm text-purple-600/80">Reviews</p>
                    <p className="text-sm sm:text-xl font-bold text-purple-900">{reviewer.reviewsCompleted}</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-purple-50/80 rounded-lg sm:rounded-xl">
                    <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-green-500 mx-auto mb-1" />
                    <p className="text-xs sm:text-sm text-purple-600/80">USD</p>
                    <p className="text-sm sm:text-xl font-bold text-purple-900">${reviewer.skipLinePriceUsd}</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-purple-50/80 rounded-lg sm:rounded-xl">
                    <Coins className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs sm:text-sm text-purple-600/80">SEI</p>
                    <p className="text-sm sm:text-xl font-bold text-purple-900">{reviewer.skipLinePriceSei}</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-purple-50/80 rounded-lg sm:rounded-xl col-span-3 sm:col-span-1">
                    <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs sm:text-sm text-purple-600/80">Free Skips</p>
                    <p className="text-sm sm:text-xl font-bold text-purple-900">{reviewer.freeSkips}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Music Links */}
        {(reviewer.dexstaProfile || reviewer.spotifyProfile || reviewer.soundcloudProfile || reviewer.youtubeProfile) && (
          <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl overflow-hidden mb-8">
            <CardHeader className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl font-bold text-center font-heading">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500">
                  Music Links
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-8 pb-6 sm:pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {reviewer.dexstaProfile && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(reviewer.dexstaProfile, "_blank")}
                    className="border-purple-300 text-purple-700 hover:bg-purple-100 rounded-xl h-12 justify-start"
                  >
                    <Music className="w-4 h-4 mr-3" />
                    Dexsta Profile
                  </Button>
                )}
                {reviewer.spotifyProfile && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(reviewer.spotifyProfile, "_blank")}
                    className="border-purple-300 text-purple-700 hover:bg-purple-100 rounded-xl h-12 justify-start"
                  >
                    <Music className="w-4 h-4 mr-3" />
                    Spotify
                  </Button>
                )}
                {reviewer.soundcloudProfile && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(reviewer.soundcloudProfile, "_blank")}
                    className="border-purple-300 text-purple-700 hover:bg-purple-100 rounded-xl h-12 justify-start"
                  >
                    <Music className="w-4 h-4 mr-3" />
                    SoundCloud
                  </Button>
                )}
                {reviewer.youtubeProfile && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(reviewer.youtubeProfile, "_blank")}
                    className="border-purple-300 text-purple-700 hover:bg-purple-100 rounded-xl h-12 justify-start"
                  >
                    <Music className="w-4 h-4 mr-3" />
                    YouTube
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submission Tabs */}
        {user && (
          <div className="mt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/10 backdrop-blur-xl border-0 p-1 rounded-3xl shadow-lg">
                <TabsTrigger
                  value="form"
                  className="flex items-center justify-center gap-2 rounded-2xl text-purple-100/60 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 hover:text-white hover:bg-white/20 font-medium py-3 px-4"
                >
                  <Music className="w-4 h-4" />
                  <span className="hidden sm:inline font-semibold">Submit</span>
                </TabsTrigger>
                <TabsTrigger
                  value="queue"
                  className="flex items-center justify-center gap-2 rounded-2xl text-purple-100/60 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 hover:text-white hover:bg-white/20 font-medium py-3 px-4"
                >
                  <Queue className="w-4 h-4" />
                  <span className="hidden sm:inline font-semibold">Queue</span>
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center justify-center gap-2 rounded-2xl text-purple-100/60 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 hover:text-white hover:bg-white/20 font-medium py-3 px-4"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline font-semibold">History</span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center justify-center gap-2 rounded-2xl text-purple-100/60 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 hover:text-white hover:bg-white/20 font-medium py-3 px-4"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline font-semibold">Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="form">
                {reviewer.isOnline ? (
                  <SubmissionForm onSubmit={() => setActiveTab("queue")} user={user} reviewerId={reviewer.id} />
                ) : (
                  <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl">
                    <CardContent className="text-center py-12 px-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Music className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-purple-900 mb-2">Reviewer Not Accepting Submissions</h3>
                      <p className="text-purple-800 mb-4">
                        @{reviewer.tiktokHandle} has not enabled reviewer mode yet
                      </p>
                      <p className="text-sm text-purple-700">
                        Check back later when they enable reviewer mode
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="queue">
                <QueueList user={user} reviewerId={reviewer.id} />
              </TabsContent>

              <TabsContent value="history">
                <HistoryList reviewerId={reviewer?.id} />
              </TabsContent>

              <TabsContent value="settings">
                <SettingsPanel user={user} isOwnProfile={user.id === reviewer?.id} reviewerId={reviewer?.id} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Submit Music Button - Only show if not logged in */}
        {!user && (
          <div className="text-center">
            {reviewer.isOnline ? (
              <>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-[1.02]">
                    <Music className="w-5 h-5 mr-2" />
                    Submit Your Music for Review
                  </Button>
                </Link>
                <p className="text-purple-100/80 text-sm mt-3">
                  Join the queue to get your music reviewed by @{reviewer.tiktokHandle}
                </p>
              </>
            ) : (
              <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl">
                <CardContent className="text-center py-8 px-8">
                  <Button 
                    disabled 
                    className="bg-gray-400 text-gray-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg cursor-not-allowed mb-4"
                  >
                    <Music className="w-5 h-5 mr-2" />
                    Reviewer Not Accepting Submissions
                  </Button>
                  <p className="text-purple-800 text-sm">
                    @{reviewer.tiktokHandle} has not enabled reviewer mode yet
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
