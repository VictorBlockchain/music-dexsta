"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Music, ExternalLink, MessageCircle, ShoppingCart, Star, Send } from "lucide-react"
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
  userProfileImage: string | null
  submittedAt: string
  status: string
  reviewedAt?: string
  rating?: number
  nftId?: string
}

interface Review {
  id: string
  submissionId: string
  reviewer: string
  comment: string
  rating: number
  createdAt: string
  completed: boolean
}

interface HistoryListProps {
  reviewerId?: string
}

export function HistoryList({ reviewerId }: HistoryListProps) {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [selectedSong, setSelectedSong] = useState<Submission | null>(null)
  const [newComment, setNewComment] = useState("")
  const [newRating, setNewRating] = useState(0)
  const [submissionDetailsOpen, setSubmissionDetailsOpen] = useState(false)
  const [selectedSubmissionDetails, setSelectedSubmissionDetails] = useState<Submission | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Load reviewed submissions from database
    if (reviewerId) {
      const loadReviewedSubmissions = async () => {
        try {
          const { data: submissionsData, error } = await supabase
            .from('submissions')
            .select(`
              *,
              profiles!user_id (
                profile_image_url
              )
            `)
            .eq('reviewer_id', reviewerId)
            .eq('status', 'reviewed')
            .order('updated_at', { ascending: false })

          if (error) {
            console.error('Error loading reviewed submissions:', error)
            return
          }

          if (submissionsData) {
            const dbSubmissions: Submission[] = submissionsData.map((sub) => ({
              id: sub.id,
              artistName: sub.artist_name,
              tiktokName: sub.tiktok_name,
              songTitle: sub.song_title,
              songLink: sub.song_link,
              songStory: sub.song_story,
              songGenre: sub.genre || 'Unknown',
              featuring: sub.featuring,
              songArt: sub.artwork_url,
              audioFile: sub.audio_file_url,
              userProfileImage: sub.profiles?.profile_image_url || null,
              submittedAt: sub.created_at,
              status: sub.status,
              reviewedAt: sub.updated_at,
              nftId: sub.nft_id
            }))
            setSubmissions(dbSubmissions)
          }
        } catch (error) {
          console.error('Error loading reviewed submissions:', error)
        }
      }
      loadReviewedSubmissions()
    }

    // Load reviews from database
    if (reviewerId) {
      const loadReviews = async () => {
        try {
          const { data: reviewsData, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('reviewer_id', reviewerId)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Error loading reviews:', error)
            return
          }

          if (reviewsData) {
            const dbReviews: Review[] = reviewsData.map((review) => ({
              id: review.id,
              submissionId: review.submission_id,
              reviewer: review.reviewer_id,
              comment: review.comment,
              rating: review.rating,
              createdAt: review.created_at,
              completed: true // All reviews in database are completed
            }))
            setReviews(dbReviews)
          }
        } catch (error) {
          console.error('Error loading reviews:', error)
        }
      }
      loadReviews()
    } else {
      // Add mock reviews for demo
      const mockReviews = [
        {
          id: "review-1",
          submissionId: "demo-1",
          reviewer: "@musicreviewer",
          comment:
            "Great track! Love the production quality and the melody is really catchy. This has potential to go viral on TikTok.",
          rating: 4,
          createdAt: new Date(Date.now() - 21600000).toISOString(),
          completed: true,
        },
        {
          id: "review-2",
          submissionId: "demo-1",
          reviewer: "@beatdrop",
          comment:
            "Solid work! The beat hits different and the vocals are clean. Would love to hear more from this artist.",
          rating: 5,
          createdAt: new Date(Date.now() - 10800000).toISOString(),
          completed: true,
        },
      ]
      setReviews(mockReviews)
      localStorage.setItem("reviews", JSON.stringify(mockReviews))
    }
  }, [])

  const openSongDetails = (song: Submission) => {
    setSelectedSong(song)
  }

  const submitReview = () => {
    if (!selectedSong || !newComment.trim() || newRating === 0) {
      toast({
        title: "Review Required",
        description: "Please add a comment and rating",
        variant: "destructive",
      })
      return
    }

    const newReview: Review = {
      id: Date.now().toString(),
      submissionId: selectedSong.id,
      reviewer: "@currentuser",
      comment: newComment,
      rating: newRating,
      createdAt: new Date().toISOString(),
      completed: true,
    }

    const updatedReviews = [...reviews, newReview]
    setReviews(updatedReviews)
    localStorage.setItem("reviews", JSON.stringify(updatedReviews))

    setNewComment("")
    setNewRating(0)

    toast({
      title: "Review Posted!",
      description: "Your review has been added to this song",
    })
  }

  const getSongReviews = (songId: string) => {
    return reviews.filter((review) => review.submissionId === songId)
  }

  const getAverageRating = (songId: string) => {
    const songReviews = getSongReviews(songId)
    if (songReviews.length === 0) return 0
    const sum = songReviews.reduce((acc, review) => acc + review.rating, 0)
    return Math.round((sum / songReviews.length) * 10) / 10
  }

  const openSubmissionDetailsModal = (submission: Submission) => {
    setSelectedSubmissionDetails(submission)
    setSubmissionDetailsOpen(true)
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interactive && onRate?.(star)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="px-8 pt-8 pb-6">
          <CardTitle className="text-2xl font-bold text-center font-heading">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500">
              Submission History
            </span>
          </CardTitle>
          <p className="text-center text-purple-600/80">{submissions.length} reviewed submissions</p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {submissions.length === 0 ? (
          <div className="col-span-full">
            <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="text-center py-12 px-8">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <p className="text-xl text-purple-900 font-semibold">No reviewed submissions yet</p>
                <p className="text-purple-600/80">Your reviewed songs will appear here</p>
            </CardContent>
          </Card>
          </div>
        ) : (
          submissions.map((submission) => {
            const avgRating = getAverageRating(submission.id)
            const reviewCount = getSongReviews(submission.id).length

            return (
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

                  {/* Genre Badge - Top Left */}
                  {submission.songGenre && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="rounded-full border border-purple-400/30 bg-purple-400/20 px-2 py-1 text-xs font-medium text-purple-200 backdrop-blur-sm">
                        {submission.songGenre}
                      </span>
                        </div>
                  )}

                  {/* Top Right: Reviewed Badge */}
                  <div className="absolute right-4 top-4 z-10">
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/20 px-2 py-1 text-xs font-medium text-emerald-200 backdrop-blur-sm">
                      ✓ Reviewed
                    </span>
                      </div>

                  {/* Bottom Left: Artist Name */}
                  <div className="absolute bottom-4 left-4 z-10">
                    <span className="rounded-lg bg-black/30 px-2 py-0.5 font-mono text-xs font-semibold tracking-tight text-white/80 backdrop-blur-sm">
                      {submission.tiktokName}
                          </span>
                        </div>

                  {/* Review Count Button - Bottom Right */}
                  <div className="absolute bottom-4 right-4 z-10">
                        <Button
                      variant="ghost"
                          size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        openSongDetails(submission)
                      }}
                      className="rounded-full border border-white/20 bg-white/10 p-2 text-white/90 hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all duration-200"
                    >
                      <Star className="w-4 h-4 mr-1" />
                      <span className="text-xs font-medium">{reviewCount}</span>
                        </Button>
                  </div>

                      </div>

                {/* Title below image - like XFT design */}
                <div className="mt-3 text-center">
                  <div className="w-full px-0.5">
                    <div className="mx-auto flex h-8 w-3/4 items-center justify-center rounded-xl border border-purple-400/10 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-amber-500/30 shadow-lg backdrop-blur-md">
                      <span className="animate-gradient-x w-full bg-gradient-to-r from-purple-300 via-pink-200 to-amber-300 bg-clip-text px-4 py-1 text-center text-lg font-extrabold tracking-wide text-transparent text-white">
                        {submission.songTitle}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Song Details Modal */}
      <Dialog open={!!selectedSong} onOpenChange={() => setSelectedSong(null)}>
        <DialogContent className="bg-black/90 backdrop-blur-sm border-purple-500/20 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedSong && (
            <>
              <DialogHeader>
                <DialogTitle className="text-purple-200 text-xl">{selectedSong.songTitle} - Reviews</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Song Info */}
                <div className="flex items-center gap-4 p-4 bg-purple-900/20 rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    {selectedSong.songArt ? (
                      <img
                        src={selectedSong.songArt || "/placeholder.svg"}
                        alt={selectedSong.songTitle}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Music className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-200">{selectedSong.songTitle}</h3>
                    <p className="text-gray-300">by {selectedSong.artistName}</p>
                    <p className="text-sm text-gray-400">
                      Reviewed on {new Date(selectedSong.reviewedAt || selectedSong.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Reviews */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-purple-200 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400" />
                    Reviews ({getSongReviews(selectedSong.id).length})
                  </h4>
                  {getSongReviews(selectedSong.id).length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mb-4">
                        <Star className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-xl text-purple-900 font-semibold">No reviews yet</p>
                      <p className="text-purple-600/80">Be the first to review this submission!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                  {getSongReviews(selectedSong.id).map((review) => (
                        <div key={review.id} className="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm p-4 hover:border-purple-400/40 transition-all duration-300">
                          {/* Review Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {review.reviewer.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <span className="font-semibold text-purple-200">{review.reviewer}</span>
                                <p className="text-xs text-purple-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <Star
                                  key={rating}
                                  className={`w-4 h-4 ${
                                    rating <= review.rating
                                      ? 'text-amber-400 fill-current'
                                      : 'text-gray-400'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          
                          {/* Review Comment */}
                          {review.comment && (
                            <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                              <p className="text-gray-200 text-sm leading-relaxed">
                                "{review.comment}"
                              </p>
                            </div>
                          )}
                          
                          {/* Decorative Elements */}
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-xl"></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Review */}
                <div className="space-y-4 p-4 bg-purple-900/10 rounded-lg border border-purple-500/20">
                  <h4 className="text-lg font-semibold text-purple-200">Add Your Review</h4>

                  <div className="space-y-2">
                    <label className="text-sm text-purple-200">Rating</label>
                    {renderStars(newRating, true, setNewRating)}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-purple-200">Comment</label>
                    <Textarea
                      value={newComment}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts about this track..."
                      className="bg-black/20 border-purple-500/30 text-white placeholder:text-gray-400"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={submitReview}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={!newComment.trim() || newRating === 0}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post Review
                  </Button>
                </div>
              </div>
            </>
          )}
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
