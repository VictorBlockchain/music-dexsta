"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Music, Users, Clock, Star, DollarSign, ExternalLink, Zap, Search, Coins } from "lucide-react"
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
}

export function ReviewersList() {
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [filteredReviewers, setFilteredReviewers] = useState<Reviewer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownSuggestions, setDropdownSuggestions] = useState<Reviewer[]>([])
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadReviewers = async () => {
      try {
        // Load reviewers from Supabase database
        const { data: reviewersData, error } = await supabase
          .from('profiles')
          .select('*')
          .not('tiktok_handle', 'is', null)
          .not('tiktok_handle', 'eq', '')
          .not('tiktok_handle', 'eq', 'null')

        console.log('Reviewers query result:', reviewersData)
        console.log('Reviewers query error:', error)
        
        if (error) {
          console.error('Error loading reviewers:', error)
          setReviewers([])
          return
        }

        if (reviewersData && reviewersData.length > 0) {
          // Filter out profiles with null or empty TikTok handles
          const validReviewers = reviewersData.filter(reviewer => 
            reviewer.tiktok_handle && 
            reviewer.tiktok_handle.trim() !== '' && 
            reviewer.tiktok_handle !== 'null'
          )
          
          console.log('Valid reviewers after filtering:', validReviewers.length, 'out of', reviewersData.length)
          
          // Load queue length and reviews completed for each reviewer
          const reviewersWithStats = await Promise.all(
            validReviewers.map(async (reviewer) => {
              // Get queue length (pending submissions)
              const { data: queueData } = await supabase
                .from('submissions')
                .select('id')
                .eq('reviewer_id', reviewer.id)
                .eq('status', 'pending')

              // Get reviews completed count
              const { data: reviewsData } = await supabase
                .from('reviews')
                .select('id')
                .eq('reviewer_id', reviewer.id)

              const queueLength = queueData?.length || 0
              const reviewsCompleted = reviewsData?.length || 0

              console.log('Processing reviewer:', reviewer)
              console.log('TikTok handle:', reviewer.tiktok_handle)
              
              return {
                id: reviewer.id,
                username: reviewer.username,
                email: reviewer.email,
                tiktokHandle: reviewer.tiktok_handle || '',
                reviewerName: reviewer.tiktok_handle || reviewer.username,
                reviewerUrl: reviewer.reviewer_url || reviewer.tiktok_handle || '',
                isOnline: reviewer.is_reviewer === true, // Reviewer is online if they have reviewer mode enabled
                queueLength,
                reviewsCompleted,
                skipLinePriceUsd: reviewer.skip_price_usd || 0,
                skipLinePriceSei: reviewer.skip_price_sei || 0,
                freeSkips: reviewer.free_skips || 0,
                averageRating: 4.2, // Mock data for now
                lastActive: new Date().toISOString(),
                profileImage: reviewer.profile_image_url
              } as Reviewer
            })
          )

          console.log('Final reviewers array:', reviewersWithStats)
          setReviewers(reviewersWithStats)
        } else {
          console.log('No reviewers found in database')
          setReviewers([])
        }
      } catch (error) {
        console.error('Error loading reviewers:', error)
        setReviewers([])
      }
    }

    // Load initial reviewers
    loadReviewers()

    // Set up real-time subscription for profile changes (including reviewer status)
    const subscription = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Real-time profile update:', payload)
          // Reload reviewers when any profile changes (including reviewer status)
          loadReviewers()
        }
      )
      .subscribe((status) => {
        console.log('Profiles subscription status:', status)
      })

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both the search input and the dropdown portal
      const target = event.target as Node
      const isClickOnSearchInput = dropdownRef.current?.contains(target)
      const isClickOnDropdown = document.querySelector('[data-dropdown-portal]')?.contains(target)
      
      if (!isClickOnSearchInput && !isClickOnDropdown) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  // Filter reviewers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredReviewers(reviewers)
      setDropdownSuggestions([])
      setShowDropdown(false)
    } else {
      const filtered = reviewers.filter(reviewer => 
        reviewer.tiktokHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reviewer.reviewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reviewer.reviewerUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reviewer.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredReviewers(filtered)
      
      // Set dropdown suggestions (limit to 5 for better UX)
      const suggestions = reviewers.filter(reviewer => 
        reviewer.tiktokHandle.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
      setDropdownSuggestions(suggestions)
      setShowDropdown(suggestions.length > 0)
    }
  }, [reviewers, searchQuery])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  const handleSuggestionClick = (reviewer: Reviewer) => {
    setSearchQuery(reviewer.tiktokHandle)
    setShowDropdown(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Calculate dropdown position when it should be shown
  useEffect(() => {
    if (showDropdown && dropdownRef.current) {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        if (dropdownRef.current) {
          const rect = dropdownRef.current.getBoundingClientRect()
          setDropdownPosition({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX,
            width: rect.width
          })
        }
      })
    }
  }, [showDropdown])


  const formatLastActive = (lastActive: string) => {
    const now = new Date()
    const active = new Date(lastActive)
    const diffMs = now.getTime() - active.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl">
        <CardHeader className="px-8 pt-8 pb-6">
          <CardTitle className="text-2xl font-bold text-center font-heading">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500">
              Active Reviewers
            </span>
          </CardTitle>
          <p className="text-center text-purple-600/80">
            {filteredReviewers.length} of {reviewers.length} reviewers
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
          
              {/* Search Bar */}
              <div className="mt-6 max-w-4xl mx-auto">
                <div className="relative" ref={dropdownRef}>
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="TikTok username"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-12 pr-4 bg-white/90 border-2 border-purple-300/50 text-purple-900 placeholder:text-purple-500 rounded-3xl h-14 text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 transition-all shadow-lg hover:shadow-xl"
                  />
                  
                  {/* Dropdown Suggestions */}
                  {showDropdown && dropdownSuggestions.length > 0 && createPortal(
                    <div className="fixed bg-white border border-purple-200 rounded-2xl shadow-xl z-[9999] max-h-60 overflow-y-auto" 
                         data-dropdown-portal
                         style={{
                           top: `${dropdownPosition.top}px`,
                           left: `${dropdownPosition.left}px`,
                           width: `${dropdownPosition.width}px`
                         }}>
                      <div className="p-2">
                        <p className="text-xs text-purple-600/80 mb-2 font-medium px-2">TikTok handles:</p>
                        {dropdownSuggestions.map((reviewer) => (
                          <button
                            key={reviewer.id}
                            type="button"
                            onClick={() => handleSuggestionClick(reviewer)}
                            className="w-full text-left p-3 hover:bg-purple-50 rounded-xl transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                {reviewer.profileImage ? (
                                  <img
                                    src={reviewer.profileImage}
                                    alt={reviewer.tiktokHandle}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <span className="text-white font-bold text-sm">
                                    {getInitials(reviewer.tiktokHandle)}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-purple-900">@{reviewer.tiktokHandle}</div>
                                <div className="text-sm text-purple-600/80">
                                  {reviewer.queueLength} in queue • {reviewer.reviewsCompleted} reviews
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>,
                    document.body
                  )}
                </div>
              </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {filteredReviewers.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="text-center py-12 px-8">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              {searchQuery ? (
                <>
                  <p className="text-xl text-purple-900 font-semibold">No reviewers found</p>
                  <p className="text-purple-600/80">No reviewers match "{searchQuery}"</p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="mt-4 border-purple-300 text-purple-700 hover:bg-purple-100 rounded-xl"
                  >
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-xl text-purple-900 font-semibold">No reviewers available</p>
                  <p className="text-purple-600/80">Check back later for active reviewers</p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredReviewers.map((reviewer) => (
            <Card key={reviewer.id} className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Profile Image */}
                  <div className="relative">
                    <Avatar className="w-16 h-16 border-2 border-purple-200">
                      {reviewer.profileImage ? (
                        <img 
                          src={reviewer.profileImage} 
                          alt={reviewer.tiktokHandle} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg">
                          {getInitials(reviewer.tiktokHandle || reviewer.username)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {/* Online Status */}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                      reviewer.isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-purple-900">@{reviewer.tiktokHandle}</h3>
                        <p className="text-sm text-purple-600/80">
                          music.dexsta.fun/{reviewer.reviewerUrl}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`${
                            reviewer.isOnline 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {reviewer.isOnline ? 'Online' : 'Offline'}
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          ⭐ {reviewer.averageRating}
                        </Badge>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center p-3 bg-purple-50/80 rounded-xl">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-purple-600">Queue</span>
                        </div>
                        <p className="text-lg font-semibold text-purple-900">{reviewer.queueLength}</p>
                      </div>
                      
                      <div className="text-center p-3 bg-purple-50/80 rounded-xl">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-purple-600">Reviews</span>
                        </div>
                        <p className="text-lg font-semibold text-purple-900">{reviewer.reviewsCompleted}</p>
                      </div>
                      
                      <div className="text-center p-3 bg-purple-50/80 rounded-xl">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-purple-600">USD</span>
                        </div>
                        <p className="text-lg font-semibold text-purple-900">${reviewer.skipLinePriceUsd}</p>
                      </div>
                      
                      <div className="text-center p-3 bg-purple-50/80 rounded-xl">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Coins className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-purple-600">SEI</span>
                        </div>
                        <p className="text-lg font-semibold text-purple-900">{reviewer.skipLinePriceSei}</p>
                      </div>
                      
                      <div className="text-center p-3 bg-purple-50/80 rounded-xl">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Zap className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-purple-600">Free Skips</span>
                        </div>
                        <p className="text-lg font-semibold text-purple-900">{reviewer.freeSkips}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://music.dexsta.fun/${reviewer.reviewerUrl}`, "_blank")}
                        className="border-purple-300 text-purple-700 hover:bg-purple-100 rounded-xl"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Page
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://tiktok.com/${reviewer.tiktokHandle}`, "_blank")}
                        className="border-purple-300 text-purple-700 hover:bg-purple-100 rounded-xl"
                      >
                        <Music className="w-4 h-4 mr-2" />
                        TikTok
                      </Button>

                      <div className="text-xs text-purple-600/80 ml-auto">
                        Last active: {formatLastActive(reviewer.lastActive)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
