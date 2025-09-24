"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Music, ExternalLink, Zap, CreditCard, Coins, ChevronUp, ChevronDown, Trash2, CheckCircle, Star, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Submission {
  id: string
  artistName: string
  tiktokName: string
  songTitle: string
  songLink: string
  songStory: string
  songGenre: string
  featuring: string
  songArt: string | null
  audioFile: string | null
  submittedAt: string
  status: string
  queuePosition?: number
}

interface Review {
  id: string
  submissionId: string
  rating: number
  comment: string
  completed: boolean
  createdAt: string
}

interface QueueListProps {
  user?: {
    id: string
    username: string
    email: string
  }
  reviewerId?: string // Add reviewerId prop
}

export function QueueList({ user, reviewerId }: QueueListProps) {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [expandedStory, setExpandedStory] = useState<string | null>(null)
  const [skipLineOpen, setSkipLineOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [currentReview, setCurrentReview] = useState<{
    submissionId: string
    rating: number
    comment: string
  }>({
    submissionId: "",
    rating: 0,
    comment: ""
  })
  const [isReviewer, setIsReviewer] = useState(false)
  const [viewReviewsOpen, setViewReviewsOpen] = useState(false)
  const [submissionReviews, setSubmissionReviews] = useState<any[]>([])
  const [selectedSubmissionForReviews, setSelectedSubmissionForReviews] = useState<string | null>(null)
  const [submissionDetailsOpen, setSubmissionDetailsOpen] = useState(false)
  const [selectedSubmissionDetails, setSelectedSubmissionDetails] = useState<Submission | null>(null)
  console.log('reviewerId', reviewerId)
  
  const supabase = createClient()
  
  const loadSubmissions = async () => {
      try {
        // Load submissions from database for this reviewer
        const { data: submissionsData, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('reviewer_id', reviewerId)
          .eq('status', 'pending')
          .order('queue_position', { ascending: true })

        if (error) {
          console.error('Error loading submissions:', error)
          return
        }

        if (submissionsData) {
          console.log('Raw submissions data:', submissionsData)
          // Convert database data to submission format
          const dbSubmissions: Submission[] = submissionsData.map((sub) => ({
            id: sub.id,
            artistName: sub.artist_name,
            tiktokName: sub.tiktok_name,
            songTitle: sub.song_title,
            songGenre: sub.genre,
            songStory: sub.song_story,
            songLink: sub.song_link,
            featuring: sub.featuring,
            songArt: sub.artwork_url,
            audioFile: sub.audio_file_url,
            submittedAt: sub.created_at,
            status: sub.status,
            queuePosition: sub.queue_position || 0
          }))
          console.log('Processed submissions:', dbSubmissions)
          setSubmissions(dbSubmissions)
        }
      } catch (error) {
        console.error('Error loading submissions:', error)
      }
    }

  useEffect(() => {
    if (!reviewerId) return

    // Load initial submissions
    loadSubmissions()

    // Set up real-time subscription for submissions
    const subscription = supabase
      .channel(`submissions-changes-${reviewerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'submissions',
          filter: `reviewer_id=eq.${reviewerId}`
        },
        (payload) => {
          console.log('Real-time submission update:', payload)
          console.log('Event type:', payload.eventType)
          console.log('Table:', payload.table)
          console.log('New data:', payload.new)
          console.log('Old data:', payload.old)
          
          // Reload submissions when there are changes
          loadSubmissions()
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    // Check if user is a reviewer
    if (user) {
      const storedSettings = localStorage.getItem(`userSettings_${user.id}`)
      if (storedSettings) {
        const settings = JSON.parse(storedSettings)
        setIsReviewer(settings.isReviewer || false)
      }
    }

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [user, reviewerId])

  const handleSkipLine = (submissionId: string) => {
    setSelectedSubmission(submissionId)
    setSkipLineOpen(true)
  }

  const processSkipPayment = (paymentMethod: "card" | "crypto") => {
    toast({
      title: "Payment Processing",
      description: `Processing ${paymentMethod} payment to skip the line...`,
    })

    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Payment Successful!",
        description: "Your submission has been moved to the front of the queue",
      })
      setSkipLineOpen(false)
      setSelectedSubmission(null)
    }, 2000)
  }

  // Reviewer functions
  const moveSubmissionUp = async (submissionId: string) => {
    const currentIndex = submissions.findIndex(s => s.id === submissionId)
    if (currentIndex > 0) {
      const currentSubmission = submissions[currentIndex]
      const targetPosition = submissions[currentIndex - 1].queuePosition
      
      try {
        console.log('Moving submission up:', {
          submissionId,
          reviewerId,
          targetPosition,
          currentPosition: currentSubmission.queuePosition
        })
        
        // Use the database function to reorder queue positions
        const { error } = await supabase.rpc('reorder_queue_positions', {
          p_reviewer_id: reviewerId,
          p_submission_id: submissionId,
          p_new_position: targetPosition
        })
        
        if (error) {
          console.error('Error moving submission up:', error)
          toast({
            title: "Error",
            description: "Failed to move submission up in queue",
            variant: "destructive",
          })
          return
        }
        
        toast({
          title: "Queue Updated",
          description: "Submission moved up in queue",
        })
        
        // Real-time subscription will handle the update automatically
        // No need to manually reload
      } catch (error) {
        console.error('Error moving submission up:', error)
        toast({
          title: "Error",
          description: "Failed to move submission up in queue",
          variant: "destructive",
        })
      }
    }
  }

  const moveSubmissionDown = async (submissionId: string) => {
    const currentIndex = submissions.findIndex(s => s.id === submissionId)
    if (currentIndex < submissions.length - 1) {
      const targetPosition = submissions[currentIndex + 1].queuePosition
      
      try {
        // Use the database function to reorder queue positions
        const { error } = await supabase.rpc('reorder_queue_positions', {
          p_reviewer_id: reviewerId,
          p_submission_id: submissionId,
          p_new_position: targetPosition
        })
        
        if (error) {
          console.error('Error moving submission down:', error)
          toast({
            title: "Error",
            description: "Failed to move submission down in queue",
            variant: "destructive",
          })
          return
        }
        
        toast({
          title: "Queue Updated",
          description: "Submission moved down in queue",
        })
        
        // Real-time subscription will handle the update automatically
        // No need to manually reload
      } catch (error) {
        console.error('Error moving submission down:', error)
        toast({
          title: "Error",
          description: "Failed to move submission down in queue",
          variant: "destructive",
        })
      }
    }
  }

  const removeSubmission = async (submissionId: string) => {
    const submission = submissions.find(s => s.id === submissionId)
    if (submission) {
      try {
        // Update submission status in database
        const { error } = await supabase
          .from('submissions')
          .update({ status: 'removed' })
          .eq('id', submissionId)
          .eq('reviewer_id', reviewerId)
        
        if (error) {
          console.error('Error removing submission:', error)
          toast({
            title: "Error",
            description: "Failed to remove submission from queue",
            variant: "destructive",
          })
          return
        }
        
        toast({
          title: "Submission Removed",
          description: `${submission.songTitle} has been removed from the queue`,
        })
        
        // Real-time subscription will handle the update automatically
        // No need to manually reload
      } catch (error) {
        console.error('Error removing submission:', error)
        toast({
          title: "Error",
          description: "Failed to remove submission from queue",
          variant: "destructive",
        })
      }
    }
  }

  const openReviewModal = (submissionId: string) => {
    setCurrentReview({
      submissionId,
      rating: 0,
      comment: ""
    })
    setReviewModalOpen(true)
  }

  const openViewReviewsModal = async (submissionId: string) => {
    try {
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading reviews:', error)
        toast({
          title: "Error",
          description: "Failed to load reviews",
          variant: "destructive",
        })
        return
      }

      setSubmissionReviews(reviewsData || [])
      setSelectedSubmissionForReviews(submissionId)
      setViewReviewsOpen(true)
    } catch (error) {
      console.error('Error loading reviews:', error)
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      })
    }
  }

  const openSubmissionDetailsModal = (submission: Submission) => {
    setSelectedSubmissionDetails(submission)
    setSubmissionDetailsOpen(true)
  }

  const submitReview = async () => {
    if (currentReview.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
        variant: "destructive"
      })
      return
    }
    
    try {
      // Save review to database
      const { error } = await supabase
        .from('reviews')
        .insert({
          submission_id: currentReview.submissionId,
          reviewer_id: reviewerId,
          rating: currentReview.rating,
          comment: currentReview.comment,
          created_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('Error saving review:', error)
        toast({
          title: "Error",
          description: "Failed to save review",
          variant: "destructive",
        })
        return
      }
      
      toast({
        title: "Review Submitted",
        description: "Your review has been saved",
      })
      
      setReviewModalOpen(false)
      setCurrentReview({ submissionId: "", rating: 0, comment: "" })
    } catch (error) {
      console.error('Error submitting review:', error)
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      })
    }
  }

  const markReviewCompleted = async (submissionId: string) => {
    const submission = submissions.find(s => s.id === submissionId)
    
    try {
      // Update submission status to reviewed in database
      const { error } = await supabase
        .from('submissions')
        .update({ status: 'reviewed' })
        .eq('id', submissionId)
        .eq('reviewer_id', reviewerId)
      
      if (error) {
        console.error('Error marking review as completed:', error)
        toast({
          title: "Error",
          description: "Failed to complete review",
          variant: "destructive",
        })
        return
      }
      
      toast({
        title: "Review Completed",
        description: `${submission?.songTitle} has been moved to history`,
      })
      
      // Real-time subscription will handle the update automatically
      // No need to manually update state
    } catch (error) {
      console.error('Error completing review:', error)
      toast({
        title: "Error",
        description: "Failed to complete review",
        variant: "destructive",
      })
    }
  }

  const updateSubmissionsInStorage = (updatedSubmissions: Submission[]) => {
    const allSubmissions = JSON.parse(localStorage.getItem("submissions") || "[]")
    const updatedAllSubmissions = allSubmissions.map((s: Submission) => {
      const updatedSubmission = updatedSubmissions.find(us => us.id === s.id)
      return updatedSubmission ? { ...s, queuePosition: updatedSubmission.queuePosition } : s
    })
    localStorage.setItem("submissions", JSON.stringify(updatedAllSubmissions))
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="px-8 pt-8 pb-6">
          <CardTitle className="text-2xl font-bold text-center font-heading">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500">
              Review Queue
            </span>
          </CardTitle>
          <p className="text-center text-purple-600/80">{submissions.length} songs waiting for review</p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {submissions.length === 0 ? (
          <div className="col-span-full">
            <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="text-center py-12 px-8">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <p className="text-xl text-purple-900 font-semibold">No submissions in queue</p>
                <p className="text-purple-600/80">Submit your music to get started!</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          submissions.map((submission, index) => (
            <div key={submission.id} className="group cursor-pointer">
              {/* Submission Card - Square Format like XFT */}
              <div className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-purple-400/30 bg-gradient-to-br from-purple-900/40 to-pink-900/40 shadow-xl transition-all duration-300 group-hover:scale-105">
                {/* Artwork - Clickable */}
                <div 
                  className="absolute inset-0 h-full w-full cursor-pointer"
                  onClick={() => openSubmissionDetailsModal(submission)}
                >
                  {submission.songArt ? (
                    <img
                      src={submission.songArt || "/placeholder.svg"}
                      alt={submission.songTitle}
                      className="h-full w-full object-cover"
                      style={{ filter: 'drop-shadow(0 4px 24px rgba(139,92,246,0.10))' }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-800/60 text-lg font-bold text-gray-500">
                      <Music className="w-16 h-16 text-white/80" />
                    </div>
                  )}
                </div>

                {/* Top Bar: Queue Position Only */}
                <div className="absolute top-0 right-0 z-10 px-4 py-3">
                  <span className="rounded-lg bg-purple-900/60 px-2 py-0.5 font-mono text-xs font-bold tracking-tight text-purple-200 shadow backdrop-blur-sm">
                    #{index + 1}
                  </span>
                </div>

                {/* Genre Badge */}
                {submission.songGenre && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="rounded-full border border-purple-400/30 bg-purple-400/20 px-2 py-1 text-xs font-medium text-purple-200 backdrop-blur-sm">
                      {submission.songGenre}
                    </span>
                  </div>
                )}

                {/* Artist Name - Bottom Left */}
                <div className="absolute bottom-4 left-4 z-10">
                  <span className="rounded-lg bg-black/30 px-2 py-0.5 font-mono text-xs font-semibold tracking-tight text-white/80 backdrop-blur-sm">
                    {submission.tiktokName}
                  </span>
                </div>

                {/* Vertical Floating Action Icons - Right Side */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-2">
                  {isReviewer ? (
                    <>
                      {/* Move Up */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveSubmissionUp(submission.id)
                        }}
                        disabled={index === 0}
                        className="rounded-full border-2 border-white bg-white p-2 text-gray-800 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>

                      {/* Move Down */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveSubmissionDown(submission.id)
                        }}
                        disabled={index === submissions.length - 1}
                        className="rounded-full border-2 border-white bg-white p-2 text-gray-800 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>

                      {/* Review */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openReviewModal(submission.id)
                        }}
                        className="rounded-full border-2 border-amber-400/50 bg-amber-400/20 p-2 text-amber-200 hover:bg-amber-400/30 hover:text-amber-100 backdrop-blur-sm transition-all duration-200 shadow-lg"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>

                      {/* Complete */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          markReviewCompleted(submission.id)
                        }}
                        className="rounded-full border-2 border-emerald-400/50 bg-emerald-400/20 p-2 text-emerald-200 hover:bg-emerald-400/30 hover:text-emerald-100 backdrop-blur-sm transition-all duration-200 shadow-lg"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>

                      {/* Remove */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeSubmission(submission.id)
                        }}
                        className="rounded-full border-2 border-red-400/50 bg-red-400/20 p-2 text-red-200 hover:bg-red-400/30 hover:text-red-100 backdrop-blur-sm transition-all duration-200 shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    /* Skip Line for Non-Reviewers */
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSkipLine(submission.id)
                      }}
                      className="rounded-full border-2 border-amber-400/50 bg-amber-400/20 p-2 text-amber-200 hover:bg-amber-400/30 hover:text-amber-100 backdrop-blur-sm transition-all duration-200 shadow-lg"
                    >
                      <Zap className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Title below image - smaller and not bold */}
              <div className="mt-3 text-center">
                <div className="w-full px-0.5">
                  <div className="mx-auto flex h-6 w-3/4 items-center justify-center rounded-lg border border-purple-400/10 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-amber-500/30 shadow-lg backdrop-blur-md">
                    <span className="animate-gradient-x w-full bg-gradient-to-r from-purple-300 via-pink-200 to-amber-300 bg-clip-text px-3 py-1 text-center text-sm font-medium tracking-wide text-transparent text-white truncate">
                      {submission.songTitle}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Skip Line Payment Modal */}
      <Dialog open={skipLineOpen} onOpenChange={setSkipLineOpen}>
        <DialogContent className="bg-black/90 backdrop-blur-sm border-purple-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-purple-200">Skip the Line</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-gray-300">Move your submission to the front of the queue for faster review.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => processSkipPayment("card")}
                className="bg-blue-600 hover:bg-blue-700 text-white p-6 h-auto flex-col"
              >
                <CreditCard className="w-8 h-8 mb-2" />
                <span className="text-lg font-semibold">Pay with Card</span>
                <span className="text-sm opacity-80">$5.00</span>
              </Button>

              <Button
                onClick={() => processSkipPayment("crypto")}
                className="bg-purple-600 hover:bg-purple-700 text-white p-6 h-auto flex-col"
              >
                <Coins className="w-8 h-8 mb-2" />
                <span className="text-lg font-semibold">Pay with Crypto</span>
                <span className="text-sm opacity-80">SEI or ERC20</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl max-w-2xl">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2 font-heading">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500">
                Review Submission
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 px-6 pb-6">
            {/* Rating */}
            <div className="space-y-3">
              <Label className="text-purple-800 font-semibold">Rating (Required)</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setCurrentReview(prev => ({ ...prev, rating }))}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      currentReview.rating >= rating
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-purple-100 text-purple-400 hover:bg-purple-200'
                    }`}
                  >
                    <Star className="w-6 h-6" />
                  </button>
                ))}
              </div>
              <p className="text-sm text-purple-600/80">
                {currentReview.rating === 0 && "Select a rating"}
                {currentReview.rating === 1 && "⭐ Poor"}
                {currentReview.rating === 2 && "⭐⭐ Fair"}
                {currentReview.rating === 3 && "⭐⭐⭐ Good"}
                {currentReview.rating === 4 && "⭐⭐⭐⭐ Great"}
                {currentReview.rating === 5 && "⭐⭐⭐⭐⭐ Excellent"}
              </p>
            </div>

            {/* Comment */}
            <div className="space-y-3">
              <Label className="text-purple-800 font-semibold">Review Comment</Label>
              <Textarea
                value={currentReview.comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your thoughts about this submission..."
                className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl min-h-[120px] focus:border-purple-400 focus:ring-purple-400/20 transition-all resize-none shadow-sm"
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setReviewModalOpen(false)}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                Cancel
              </Button>
              <Button
                onClick={submitReview}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Star className="w-4 h-4 mr-2" />
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Reviews Modal */}
      <Dialog open={viewReviewsOpen} onOpenChange={setViewReviewsOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl max-w-2xl">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2 font-heading">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                Submission Reviews
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 px-6 pb-6">
            {submissionReviews.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <p className="text-xl text-purple-900 font-semibold">No reviews yet</p>
                <p className="text-purple-600/80">Be the first to review this submission!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissionReviews.map((review) => (
                  <div key={review.id} className="bg-purple-50/80 rounded-2xl p-4 border border-purple-200/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Star
                              key={rating}
                              className={`w-4 h-4 ${
                                rating <= review.rating
                                  ? 'text-amber-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-purple-600/80">
                          {review.rating}/5 stars
                        </span>
                      </div>
                      <span className="text-xs text-purple-500/60">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-purple-800 text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setViewReviewsOpen(false)}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submission Details Modal */}
      <Dialog open={submissionDetailsOpen} onOpenChange={setSubmissionDetailsOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedSubmissionDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-purple-900 text-center">
                  Submission Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Artwork */}
                <div className="flex justify-center">
                  <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-xl">
                    {selectedSubmissionDetails.songArt ? (
                      <img
                        src={selectedSubmissionDetails.songArt}
                        alt={selectedSubmissionDetails.songTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Music className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Song Info */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-purple-900 mb-2">
                      {selectedSubmissionDetails.songTitle}
                    </h2>
                    <p className="text-lg text-purple-700">
                      by {selectedSubmissionDetails.artistName}
                    </p>
                    <p className="text-sm text-purple-600">
                      @{selectedSubmissionDetails.tiktokName}
                    </p>
                  </div>

                  {/* Genre */}
                  {selectedSubmissionDetails.songGenre && (
                    <div className="flex justify-center">
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 px-3 py-1">
                        {selectedSubmissionDetails.songGenre}
                      </Badge>
                    </div>
                  )}

                  {/* Story */}
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <h3 className="font-semibold text-purple-900 mb-2">Song Story</h3>
                    <p className="text-purple-800 leading-relaxed">
                      {selectedSubmissionDetails.songStory}
                    </p>
                  </div>

                  {/* Featuring */}
                  {selectedSubmissionDetails.featuring && (
                    <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
                      <h3 className="font-semibold text-pink-900 mb-2">Featuring</h3>
                      <p className="text-pink-800">
                        {selectedSubmissionDetails.featuring}
                      </p>
                    </div>
                  )}

                  {/* Audio Player */}
                  {selectedSubmissionDetails.audioFile && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">Listen</h3>
                      <audio 
                        controls 
                        className="w-full audio-player"
                        preload="metadata"
                      >
                        <source src={selectedSubmissionDetails.audioFile} type="audio/mpeg" />
                        <source src={selectedSubmissionDetails.audioFile} type="audio/wav" />
                        <source src={selectedSubmissionDetails.audioFile} type="audio/mp3" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  {/* Play Link */}
                  <div className="flex justify-center">
                    <Button
                      onClick={() => window.open(selectedSubmissionDetails.songLink, "_blank")}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl px-6 py-3"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Play on Platform
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setSubmissionDetailsOpen(false)}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
