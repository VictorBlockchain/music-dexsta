"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomButton } from "@/components/ui/custom-button"
import { Button } from "@/components/ui/button"
import { Upload, Music, ExternalLink, Sparkles, FileAudio } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface User {
  username: string
  email: string
  id: string
}

interface SubmissionFormProps {
  onSubmit: () => void
  user: User
  reviewerId?: string // Add reviewerId prop
}

const musicGenres = [
  "Hip Hop",
  "R&B",
  "Pop",
  "Rock",
  "Electronic",
  "Jazz",
  "Country",
  "Reggae",
  "Latin",
  "Alternative",
  "Indie",
  "Folk",
  "Classical",
  "Other",
]

export function SubmissionForm({ onSubmit, user, reviewerId }: SubmissionFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    artistName: "",
    tiktokName: "",
    songTitle: "",
    songGenre: "",
    songLink: "",
    songStory: "",
    featuring: "",
    agreedToTerms: false,
  })
  const [songArt, setSongArt] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<{
    songArt?: string
    audioFile?: string
  }>({})
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pastSubmissions, setPastSubmissions] = useState<any[]>([])
  const [showPastSubmissions, setShowPastSubmissions] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load user's saved artist name and TikTok handle from database
  useEffect(() => {
    const loadUserProfile = async () => {
      const supabase = createClient()
      
      try {
        // Load user profile from database
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('artist_name, tiktok_handle')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setFormData(prev => ({
            ...prev,
            artistName: profileData.artist_name || "",
            tiktokName: profileData.tiktok_handle || "",
          }))
        } else {
          // Fall back to localStorage if database fails
          const storedSettings = localStorage.getItem(`userSettings_${user.id}`)
          if (storedSettings) {
            const settings = JSON.parse(storedSettings)
            setFormData(prev => ({
              ...prev,
              artistName: settings.artistName || "",
              tiktokName: settings.tiktokHandle || "",
            }))
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
        // Fall back to localStorage
        const storedSettings = localStorage.getItem(`userSettings_${user.id}`)
        if (storedSettings) {
          const settings = JSON.parse(storedSettings)
          setFormData(prev => ({
            ...prev,
            artistName: settings.artistName || "",
            tiktokName: settings.tiktokHandle || "",
          }))
        }
      }
    }

    loadUserProfile()
  }, [user.id])

  // Load user's past submissions
  useEffect(() => {
    const loadPastSubmissions = async () => {
      const supabase = createClient()
      
      try {
        const { data: submissionsData, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10) // Limit to last 10 submissions

        if (error) {
          console.error('Error loading past submissions:', error)
          return
        }

        if (submissionsData) {
          setPastSubmissions(submissionsData)
        }
      } catch (error) {
        console.error('Error loading past submissions:', error)
      }
    }

    loadPastSubmissions()
  }, [user.id])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPastSubmissions(false)
      }
    }

    if (showPastSubmissions) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPastSubmissions])

  // Filter past submissions based on song title input
  const filteredPastSubmissions = pastSubmissions.filter(submission =>
    submission.song_title.toLowerCase().includes(formData.songTitle.toLowerCase())
  )

  // Handle song title input change
  const handleSongTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, songTitle: value }))
    
    // Filter past submissions based on the new value being typed
    const filteredSubmissions = pastSubmissions.filter(submission =>
      submission.song_title.toLowerCase().includes(value.toLowerCase())
    )
    setShowPastSubmissions(value.length > 0 && filteredSubmissions.length > 0)
  }

  // Auto-populate form with past submission data
  const populateFromPastSubmission = (submission: any) => {
    setFormData(prev => ({
      ...prev,
      songTitle: submission.song_title,
      songGenre: submission.genre,
      songStory: submission.song_story,
      songLink: submission.song_link,
      featuring: submission.featuring,
    }))
    setShowPastSubmissions(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.agreedToTerms) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      // First, save/update user profile with artist name and TikTok handle
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: user.username,
          email: user.email,
          artist_name: formData.artistName,
          tiktok_handle: formData.tiktokName,
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Error saving profile:', profileError)
        // Continue with submission even if profile save fails
      }

      // Save to Supabase submissions table
      const { data, error } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          reviewer_id: reviewerId, // Link to the reviewer's profile ID
          artist_name: formData.artistName,
          tiktok_name: formData.tiktokName,
          song_title: formData.songTitle,
          genre: formData.songGenre,
          song_story: formData.songStory,
          song_link: formData.songLink,
          featuring: formData.featuring,
          artwork_url: uploadedFiles.songArt || null,
          audio_file_url: uploadedFiles.audioFile || null,
          status: "pending",
          created_at: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('Error saving submission to database:', error)
        throw error
      }

      // Also save to localStorage as backup
      const submissions = JSON.parse(localStorage.getItem("submissions") || "[]")
      const newSubmission = {
        id: data?.[0]?.id || Date.now().toString(),
        ...formData,
        submittedBy: user.id,
        submitterUsername: user.username,
        submitterEmail: user.email,
            songArt: uploadedFiles.songArt || null,
            audioFile: uploadedFiles.audioFile || null,
        submittedAt: new Date().toISOString(),
        status: "pending",
      }

      submissions.push(newSubmission)
      localStorage.setItem("submissions", JSON.stringify(submissions))

      toast({
        title: "Submission Successful!",
        description: "Your music has been added to the review queue",
      })
    } catch (error) {
      console.error('Submission error:', error)
      toast({
        title: "Submission Failed",
        description: "Failed to submit your music. Please try again.",
        variant: "destructive",
      })
      return
    } finally {
      setIsSubmitting(false)
    }

    // Reset form but preserve user's saved artist name and TikTok handle
    const storedSettings = localStorage.getItem(`userSettings_${user.id}`)
    const settings = storedSettings ? JSON.parse(storedSettings) : {}
    
    setFormData({
      artistName: settings.artistName || "",
      tiktokName: settings.tiktokHandle || "",
      songTitle: "",
      songGenre: "",
      songLink: "",
      songStory: "",
      featuring: "",
      agreedToTerms: false,
    })
        setSongArt(null)
        setAudioFile(null)
        setUploadedFiles({})

    onSubmit()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSongArt(file)
      await uploadFile(file, 'songArt')
    }
  }

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      await uploadFile(file, 'audioFile')
    }
  }


  const uploadFile = async (file: File, type: 'songArt' | 'audioFile') => {
    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setUploadedFiles(prev => ({
          ...prev,
          [type]: result.url
        }))
        toast({
          title: "File Uploaded!",
          description: `${file.name} has been uploaded successfully`,
        })
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl overflow-hidden">
      <CardHeader className="pb-8 px-8 pt-8">
        <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-3 font-heading">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500">
            Submit Your Music
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="artistName" className="text-purple-800 font-semibold">
                Artist Name
              </Label>
              <Input
                id="artistName"
                value={formData.artistName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev) => ({ ...prev, artistName: e.target.value }))}
                className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
                placeholder="Your artist name"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="tiktokName" className="text-purple-800 font-semibold">
                TikTok Username
              </Label>
              <Input
                id="tiktokName"
                value={formData.tiktokName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev) => ({ ...prev, tiktokName: e.target.value }))}
                className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
                placeholder="@yourtiktok"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 relative">
              <Label htmlFor="songTitle" className="text-purple-800 font-semibold">
                Song Title
              </Label>
              <div className="relative" ref={dropdownRef}>
                <Input
                  id="songTitle"
                  value={formData.songTitle}
                  onChange={handleSongTitleChange}
                  className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
                  placeholder="Your amazing song title"
                  required
                />
                
                {/* Past Submissions Dropdown */}
                {showPastSubmissions && filteredPastSubmissions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-purple-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <p className="text-xs text-purple-600/80 mb-2 font-medium">Previous submissions:</p>
                      {filteredPastSubmissions.map((submission) => (
                        <button
                          key={submission.id}
                          type="button"
                          onClick={() => populateFromPastSubmission(submission)}
                          className="w-full text-left p-3 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <div className="font-medium text-purple-900">{submission.song_title}</div>
                          <div className="text-sm text-purple-600/80">
                            {submission.genre} • {new Date(submission.created_at).toLocaleDateString()}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="songGenre" className="text-purple-800 font-semibold">
                Genre
              </Label>
              <Select
                value={formData.songGenre}
                onValueChange={(value: string) => setFormData((prev) => ({ ...prev, songGenre: value }))}
              >
                <SelectTrigger className="bg-purple-50/80 border-purple-200/50 text-purple-900 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 shadow-sm">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent className="bg-white border-purple-200 rounded-2xl">
                  {musicGenres.map((genre) => (
                    <SelectItem key={genre} value={genre} className="text-purple-900 focus:bg-purple-100">
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="songLink" className="text-purple-800 font-semibold flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-purple-500" />
              Song Link (YouTube, Spotify, SoundCloud)
            </Label>
            <Input
              id="songLink"
              type="url"
              value={formData.songLink}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev) => ({ ...prev, songLink: e.target.value }))}
              className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
              placeholder="https://..."
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="songStory" className="text-purple-800 font-semibold">
              Song Story
            </Label>
            <Textarea
              id="songStory"
              value={formData.songStory}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData((prev) => ({ ...prev, songStory: e.target.value }))}
              className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl min-h-[120px] focus:border-purple-400 focus:ring-purple-400/20 transition-all resize-none shadow-sm"
              placeholder="Tell us about your song, inspiration, or any special story behind it..."
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="featuring" className="text-purple-800 font-semibold">
              Featuring (Optional)
            </Label>
            <Input
              id="featuring"
              value={formData.featuring}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev) => ({ ...prev, featuring: e.target.value }))}
              className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
              placeholder="@tiktokuser1, @tiktokuser2"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-purple-800 font-semibold flex items-center gap-2">
              <Upload className="w-4 h-4 text-purple-500" />
              Song Artwork
            </Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="bg-purple-50/80 border-purple-200/50 text-purple-900 rounded-2xl h-12 file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white file:border-0 file:rounded-xl file:px-4 file:py-2 file:mr-4 hover:file:from-purple-600 hover:file:to-pink-600 transition-all shadow-sm"
            />
            {songArt && (
              <p className="text-sm text-emerald-400 flex items-center gap-2">
                {uploadedFiles.songArt ? '✓' : '⏳'} {songArt.name} {uploadedFiles.songArt ? 'uploaded' : 'uploading...'}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-purple-800 font-semibold flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-purple-500" />
              Audio File (MP3)
            </Label>
            <Input
              type="file"
              accept="audio/mp3,audio/mpeg,.mp3"
              onChange={handleAudioFileChange}
              className="bg-purple-50/80 border-purple-200/50 text-purple-900 rounded-2xl h-12 file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white file:border-0 file:rounded-xl file:px-4 file:py-2 file:mr-4 hover:file:from-purple-600 hover:file:to-pink-600 transition-all shadow-sm"
            />
            {audioFile && (
              <p className="text-sm text-emerald-400 flex items-center gap-2">
                {uploadedFiles.audioFile ? '✓' : '⏳'} {audioFile.name} {uploadedFiles.audioFile ? 'uploaded' : 'uploading...'}
              </p>
            )}
          </div>

          <div className="bg-purple-50/80 p-6 rounded-2xl border border-purple-200/50">
            <h3 className="font-semibold text-purple-900 mb-4 text-lg font-heading">Important Disclaimer</h3>
            <div className="space-y-2 text-sm text-purple-700 leading-relaxed">
              <p>• You own all rights to your music, image and likeness</p>
              <p>• We will not use your music, image or likeness in any way, ever</p>
              <p>
                • If we like your music, we will reach out to you to make your music into a music NFT on the dexsta.fun
                platform
              </p>
            </div>

            <div className="flex items-center space-x-3 mt-6">
              <Checkbox
                id="terms"
                checked={formData.agreedToTerms}
                onCheckedChange={(checked: boolean) => setFormData((prev) => ({ ...prev, agreedToTerms: checked }))}
                className="border-purple-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500 data-[state=checked]:border-purple-500 rounded-md"
              />
              <Label htmlFor="terms" className="text-sm text-purple-800 leading-relaxed font-medium">
                I agree to the terms and conditions above
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-[1.02] font-heading text-lg"
            disabled={!formData.agreedToTerms || isUploading || isSubmitting}
          >
            <Music className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Submitting...' : isUploading ? 'Uploading Files...' : 'Submit Your Music'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
