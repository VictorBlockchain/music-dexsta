"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CustomButton } from "@/components/ui/custom-button"
import { Button } from "@/components/ui/button"
import { Settings, Music, Edit, Save, X, ExternalLink, DollarSign, CreditCard, Coins, Gift, Headphones, Youtube, Play, Copy, Check, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface UserSettings {
  isReviewer: boolean
  reviewerName: string
  bio: string
  tiktokHandle: string
  artistName: string
  profileImage: string | null
  // Skip Line Payments
  skipLinePayments: {
    cashapp: string
    applePay: string
    sei: string
    freeSkips: number
    skipPriceUsd: number
    skipPriceSei: number
  }
  // My Music Links
  myMusic: {
    dexsta: string
    spotify: string
    soundcloud: string
    youtube: string
  }
  // Reviewer URL
  reviewerUrl: string
}

interface Submission {
  id: string
  artistName: string
  tiktokName: string
  songTitle: string
  songGenre?: string
  songLink: string
  songStory: string
  featuring: string
  songArt: string | null
  submittedAt: string
  status: string
  nftId?: string
  submittedBy?: string
}

interface SettingsPanelProps {
  user: {
    username: string
    email: string
    id: string
  }
  isOwnProfile?: boolean
  reviewerId?: string // Add reviewerId prop for loading other user's data
}

export function SettingsPanel({ user, isOwnProfile = true, reviewerId }: SettingsPanelProps) {
  const { toast } = useToast()
  const [settings, setSettings] = useState<UserSettings>({
    isReviewer: false,
    reviewerName: "",
    bio: "",
    tiktokHandle: "",
    artistName: "",
    profileImage: null,
    skipLinePayments: {
      cashapp: "",
      applePay: "",
      sei: "",
      freeSkips: 0,
      skipPriceUsd: 0,
      skipPriceSei: 0
    },
    myMusic: {
      dexsta: "",
      spotify: "",
      soundcloud: "",
      youtube: "",
    },
    reviewerUrl: "",
  })
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([])
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null)
  const [editForm, setEditForm] = useState<Partial<Submission>>({})
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    const loadUserData = async () => {
      const supabase = createClient()
      
      try {
        // Load user settings from database first
        const userId = isOwnProfile ? user.id : (reviewerId || user.id)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (profileError) {
          console.error('Error loading profile:', profileError)
          // Fall back to localStorage
    const storedSettings = localStorage.getItem(`userSettings_${user.id}`)
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings))
    }
        } else if (profileData) {
          // Convert database data to settings format
          const dbSettings: UserSettings = {
            isReviewer: profileData.is_reviewer || false,
            reviewerName: profileData.reviewer_name || '',
            bio: profileData.bio || '',
            tiktokHandle: profileData.tiktok_handle || '',
            artistName: profileData.artist_name || '',
            profileImage: profileData.profile_image_url || null,
            skipLinePayments: {
              cashapp: profileData.cashapp || '',
              applePay: profileData.apple_pay || '',
              sei: profileData.sei_wallet || '',
              freeSkips: profileData.free_skips || 0,
              skipPriceUsd: profileData.skip_price_usd || 0,
              skipPriceSei: profileData.skip_price_sei || 0,
            },
            myMusic: {
              dexsta: profileData.dexsta_profile || '',
              spotify: profileData.spotify_profile || '',
              soundcloud: profileData.soundcloud_profile || '',
              youtube: profileData.youtube_profile || '',
            },
            reviewerUrl: profileData.reviewer_url || '',
          }
          setSettings(dbSettings)
          
          // Also update localStorage as backup
          localStorage.setItem(`userSettings_${user.id}`, JSON.stringify(dbSettings))
        }

        // Load user's submissions from database
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('submissions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (submissionsError) {
          console.error('Error loading submissions:', submissionsError)
          // Fall back to localStorage
    const storedSubmissions = localStorage.getItem("submissions")
    if (storedSubmissions) {
      const allSubmissions = JSON.parse(storedSubmissions)
      const userSubmissions = allSubmissions.filter((sub: Submission) => sub.submittedBy === user.id)
      setMySubmissions(userSubmissions)
    }
        } else if (submissionsData) {
          // Convert database data to submission format
          const dbSubmissions: Submission[] = submissionsData.map(sub => ({
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
            submittedBy: sub.user_id,
            submitterUsername: user.username,
            submitterEmail: user.email,
            submittedAt: sub.created_at,
            status: sub.status,
          }))
          setMySubmissions(dbSubmissions)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        // Fall back to localStorage
    const storedSettings = localStorage.getItem(`userSettings_${user.id}`)
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings))
    }

    const storedSubmissions = localStorage.getItem("submissions")
    if (storedSubmissions) {
      const allSubmissions = JSON.parse(storedSubmissions)
      const userSubmissions = allSubmissions.filter((sub: Submission) => sub.submittedBy === user.id)
      setMySubmissions(userSubmissions)
    }
      }
    }

    loadUserData()
  }, [user.id, user.username, user.email, isOwnProfile, reviewerId])

  const saveSettings = async () => {
    setIsSaving(true)
    const supabase = createClient()
    
    try {
      // Check if required fields are filled for reviewer mode
      if (settings.isReviewer) {
        if (!settings.artistName.trim() || !settings.tiktokHandle.trim()) {
          setErrorMessage("Please complete your artist name and TikTok handle before becoming a reviewer.")
          setShowErrorModal(true)
          setIsSaving(false)
          return
        }
      }

      // Validate profile before saving
      const isValid = await validateProfile()
      if (!isValid) {
        setErrorMessage("Please fix the validation errors before saving your profile.")
        setShowErrorModal(true)
        setIsSaving(false)
        return
      }

      // Save to Supabase profiles table
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: user.username,
          email: user.email,
          artist_name: settings.artistName,
          tiktok_handle: settings.tiktokHandle,
          bio: settings.bio,
          profile_image_url: settings.profileImage,
          is_reviewer: settings.isReviewer,
          reviewer_name: settings.tiktokHandle, // Use TikTok handle as reviewer name
          cashapp: settings.skipLinePayments.cashapp,
          apple_pay: settings.skipLinePayments.applePay,
          sei_wallet: settings.skipLinePayments.sei,
          free_skips: settings.skipLinePayments.freeSkips,
          skip_price_usd: settings.skipLinePayments.skipPriceUsd,
          skip_price_sei: settings.skipLinePayments.skipPriceSei,
          dexsta_profile: settings.myMusic.dexsta,
          spotify_profile: settings.myMusic.spotify,
          soundcloud_profile: settings.myMusic.soundcloud,
          youtube_profile: settings.myMusic.youtube,
          reviewer_url: settings.tiktokHandle ? settings.tiktokHandle.replace('@', '') : '',
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving to database:', error)
        throw error
      }

      // Also save to localStorage as backup
    localStorage.setItem(`userSettings_${user.id}`, JSON.stringify(settings))
      
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Save error:', error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to save your profile. Please try again.")
      setShowErrorModal(true)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReviewerToggle = (enabled: boolean) => {
    setSettings((prev) => ({ ...prev, isReviewer: enabled }))
  }

  const openEditSubmission = (submission: Submission) => {
    setEditingSubmission(submission)
    setEditForm({
      artistName: submission.artistName,
      tiktokName: submission.tiktokName,
      songTitle: submission.songTitle,
      songGenre: submission.songGenre,
      songLink: submission.songLink,
      songStory: submission.songStory,
      featuring: submission.featuring,
      nftId: submission.nftId || "",
    })
  }

  const saveSubmissionEdit = () => {
    if (!editingSubmission) return

    const allSubmissions = JSON.parse(localStorage.getItem("submissions") || "[]")
    const updatedSubmissions = allSubmissions.map((sub: Submission) =>
      sub.id === editingSubmission.id ? { ...sub, ...editForm } : sub,
    )

    localStorage.setItem("submissions", JSON.stringify(updatedSubmissions))

    // Update local state
    const userSubmissions = updatedSubmissions.filter((sub: Submission) => sub.submittedBy === user.id)
    setMySubmissions(userSubmissions)

    toast({
      title: "Submission Updated",
      description: "Your submission has been updated successfully",
    })

    setEditingSubmission(null)
    setEditForm({})
  }

  const copyReviewerUrl = async () => {
    const handle = settings.tiktokHandle ? settings.tiktokHandle.replace('@', '') : ''
    const fullUrl = `https://music.dexsta.fun/${handle}`
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopiedUrl(true)
      toast({
        title: "URL Copied!",
        description: "Your reviewer URL has been copied to clipboard",
      })
      setTimeout(() => setCopiedUrl(false), 2000)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      })
    }
  }

  const validateMusicUrl = (url: string, platform: string): boolean => {
    if (!url) return true // Allow empty URLs
    
    const validDomains: {[key: string]: string[]} = {
      dexsta: ['dexsta.fun', 'www.dexsta.fun'],
      youtube: ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'],
      spotify: ['spotify.com', 'open.spotify.com'],
      soundcloud: ['soundcloud.com', 'www.soundcloud.com']
    }
    
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname.toLowerCase()
      const validDomainsForPlatform = validDomains[platform] || []
      
      return validDomainsForPlatform.some(validDomain => 
        domain === validDomain || domain.endsWith('.' + validDomain)
      )
    } catch {
      return false
    }
  }

  const validateProfile = async (): Promise<boolean> => {
    const errors: {[key: string]: string} = {}
    
    // Check required fields for reviewer mode
    if (settings.isReviewer) {
      if (!settings.artistName.trim()) {
        errors.artistName = "Artist name is required to become a reviewer"
      }
      if (!settings.tiktokHandle.trim()) {
        errors.tiktokHandle = "TikTok handle is required to become a reviewer"
      }
    }
    
    // Validate music URLs
    if (settings.myMusic.dexsta && !validateMusicUrl(settings.myMusic.dexsta, 'dexsta')) {
      errors.dexsta = "Please enter a valid Dexsta.fun URL"
    }
    if (settings.myMusic.youtube && !validateMusicUrl(settings.myMusic.youtube, 'youtube')) {
      errors.youtube = "Please enter a valid YouTube URL"
    }
    if (settings.myMusic.spotify && !validateMusicUrl(settings.myMusic.spotify, 'spotify')) {
      errors.spotify = "Please enter a valid Spotify URL"
    }
    if (settings.myMusic.soundcloud && !validateMusicUrl(settings.myMusic.soundcloud, 'soundcloud')) {
      errors.soundcloud = "Please enter a valid SoundCloud URL"
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    const supabase = createClient()

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `profile-images/${fileName}`

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        throw uploadError
      }

      // Get public URL
      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath)

      setSettings((prev) => ({ ...prev, profileImage: data.publicUrl }))
      
      toast({
        title: "Image Uploaded!",
        description: "Your profile image has been uploaded successfully",
      })
    } catch (error) {
      console.error('Image upload error:', error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImage(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="px-8 pt-8 pb-6">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2 font-heading">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500">
            Settings
            </span>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Only show Profile Settings for own profile */}
      {isOwnProfile && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Profile Settings */}
          <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-xl flex items-center gap-2 font-heading">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Music className="w-4 h-4 text-white" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Profile Settings
                </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="p-4 bg-purple-50/80 rounded-xl border border-purple-200/50">
                <p className="text-sm text-purple-600/80">Logged in as</p>
                <p className="font-medium text-purple-900">{user.username}</p>
                <p className="text-sm text-purple-600/80">{user.email}</p>
              </div>

              {/* Artist Name */}
              <div className="space-y-2">
                <Label className="text-purple-800 font-semibold">Artist Name</Label>
                <Input
                  value={settings.artistName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings((prev) => ({ ...prev, artistName: e.target.value }))}
                  placeholder="Your artist name"
                  className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
                />
              </div>

              {/* TikTok Handle */}
              <div className="space-y-2">
                <Label className="text-purple-800 font-semibold">TikTok Handle</Label>
                <Input
                  value={settings.tiktokHandle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings((prev) => ({ ...prev, tiktokHandle: e.target.value }))}
                  placeholder="@yourtiktok"
                  className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
                />
            </div>

            {/* Profile Image */}
            <div className="space-y-2">
                <Label className="text-purple-800 font-semibold">Profile Image</Label>
              <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center relative">
                    {isUploadingImage ? (
                      <div className="w-full h-full bg-purple-100 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : settings.profileImage ? (
                    <img
                      src={settings.profileImage || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <Music className="w-8 h-8 text-white" />
                  )}
                </div>
                  <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                      disabled={isUploadingImage}
                      className="bg-purple-50/80 border-purple-200/50 text-purple-900 rounded-2xl h-12 file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white file:border-0 file:rounded-xl file:px-4 file:py-2 file:mr-4 hover:file:from-purple-600 hover:file:to-pink-600 transition-all shadow-sm disabled:opacity-50"
                />
                    {isUploadingImage && (
                      <p className="text-sm text-purple-600/80 mt-1">Uploading image...</p>
                    )}
              </div>
            </div>
            </div>

              {/* Bio */}
            <div className="space-y-2">
                <Label className="text-purple-800 font-semibold">Bio</Label>
              <Textarea
                value={settings.bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSettings((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                  className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl min-h-[100px] focus:border-purple-400 focus:ring-purple-400/20 transition-all resize-none shadow-sm"
                rows={3}
              />
            </div>

              <CustomButton 
                onClick={saveSettings} 
                variant="gradient" 
                className="w-full"
                disabled={isSaving}
              >
              <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Profile"}
            </CustomButton>
          </CardContent>
        </Card>

        {/* Reviewer Settings or Payment Options */}
        {isOwnProfile ? (
          <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="px-6 pt-6 pb-4">
            <CardTitle className="text-xl flex items-center gap-2 font-heading">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                Reviewer Mode
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-purple-50/80 rounded-xl border border-purple-200/50">
              <div>
                <Label className="text-purple-800 font-semibold">Enable Reviewer Mode</Label>
                <p className="text-sm text-purple-600/80">Allow you to review and rate submitted music</p>
              </div>
              <Switch checked={settings.isReviewer} onCheckedChange={handleReviewerToggle} />
            </div>

            {/* Save Reviewer Settings Button */}
            <CustomButton 
              onClick={saveSettings} 
              variant="gradient" 
              className="w-full"
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Reviewer Settings"}
            </CustomButton>

            {settings.isReviewer && (
              <div className="space-y-6 p-4 bg-purple-50/80 rounded-xl border border-purple-200/50">
                <div className="space-y-2">
                  <Label className="text-purple-800 font-semibold flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-purple-600" />
                    Reviewer URL
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 font-medium">music.dexsta.fun/</span>
                    <div className="flex-1 bg-purple-100/50 border border-purple-200/50 rounded-2xl h-12 px-4 flex items-center">
                      <span className="text-purple-700 font-medium">
                        {settings.tiktokHandle ? settings.tiktokHandle.replace('@', '') : 'tiktokhandle'}
                      </span>
                    </div>
                    <Button
                      onClick={copyReviewerUrl}
                      disabled={!settings.tiktokHandle}
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-700 hover:bg-purple-100 rounded-xl h-12 px-4"
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-purple-600/80">
                    This is where artists will submit music to you (auto-generated from your TikTok handle)
                  </p>
                </div>

                {/* Visit Reviewer Page Button */}
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      const handle = settings.tiktokHandle ? settings.tiktokHandle.replace('@', '') : ''
                      if (handle) {
                        window.open(`/${handle}`, '_blank')
                      }
                    }}
                    disabled={!settings.tiktokHandle}
                    variant="outline"
                    className="w-full border-purple-300 text-purple-700 hover:bg-purple-100 rounded-xl h-12"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Your Reviewer Page
                  </Button>
                  <p className="text-xs text-purple-600/80 text-center">
                    Preview how artists will see your reviewer page
                  </p>
                </div>

                {/* Skip Line Payments Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-3 h-3 text-white" />
                    </div>
                    Skip Line Payments
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Skip Prices */}
                    <div className="space-y-4">
                      <h5 className="text-md font-semibold text-purple-800 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-purple-600" />
                        Skip Line Prices
                      </h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-purple-800 font-semibold flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            USD Price
                          </Label>
                  <Input
                            type="number"
                            min="0"
                            step="1"
                            value={settings.skipLinePayments.skipPriceUsd}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings((prev) => ({ 
                              ...prev, 
                              skipLinePayments: { ...prev.skipLinePayments, skipPriceUsd: parseInt(e.target.value) || 0 }
                            }))}
                            placeholder="0"
                            className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
                          />
                          <p className="text-xs text-purple-600/80">
                            Price in USD (e.g., 5, 10, 25)
                          </p>
                </div>

                        <div className="space-y-2">
                          <Label className="text-purple-800 font-semibold flex items-center gap-2">
                            <Coins className="w-4 h-4 text-blue-600" />
                            SEI Price
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={settings.skipLinePayments.skipPriceSei}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings((prev) => ({ 
                              ...prev, 
                              skipLinePayments: { ...prev.skipLinePayments, skipPriceSei: parseFloat(e.target.value) || 0 }
                            }))}
                            placeholder="0.0"
                            className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
                          />
                          <p className="text-xs text-purple-600/80">
                            Price in SEI (e.g., 0.5, 3.0, 10.5)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-purple-800 font-semibold flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-purple-600" />
                          CashApp
                        </Label>
                      <Input
                        value={settings.skipLinePayments.cashapp}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings((prev) => ({ 
                          ...prev, 
                          skipLinePayments: { ...prev.skipLinePayments, cashapp: e.target.value }
                        }))}
                        placeholder="$cashapp"
                        className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-purple-800 font-semibold flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-purple-600" />
                        Apple Pay
                      </Label>
                      <Input
                        value={settings.skipLinePayments.applePay}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings((prev) => ({ 
                          ...prev, 
                          skipLinePayments: { ...prev.skipLinePayments, applePay: e.target.value }
                        }))}
                        placeholder="Apple Pay info"
                        className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-purple-800 font-semibold flex items-center gap-2">
                        <Coins className="w-4 h-4 text-purple-600" />
                        SEI (Crypto)
                      </Label>
                      <Input
                        value={settings.skipLinePayments.sei}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings((prev) => ({ 
                          ...prev, 
                          skipLinePayments: { ...prev.skipLinePayments, sei: e.target.value }
                        }))}
                        placeholder="SEI wallet address"
                        className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-purple-800 font-semibold flex items-center gap-2">
                        <Gift className="w-4 h-4 text-purple-600" />
                        Free Skips
                      </Label>
                      <Input
                        type="number"
                        value={settings.skipLinePayments.freeSkips}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings((prev) => ({ 
                          ...prev, 
                          skipLinePayments: { ...prev.skipLinePayments, freeSkips: parseInt(e.target.value) || 0 }
                        }))}
                        placeholder="0"
                        className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
                      />
                    </div>
                    </div>
                  </div>
                </div>

                {/* My Music Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Music className="w-3 h-3 text-white" />
                    </div>
                    My Music
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-purple-800 font-semibold flex items-center gap-2">
                        <Music className="w-4 h-4 text-purple-600" />
                        Dexsta
                      </Label>
                      <Input
                        value={settings.myMusic.dexsta}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings((prev) => ({ 
                          ...prev, 
                          myMusic: { ...prev.myMusic, dexsta: e.target.value }
                        }))}
                        placeholder="https://dexsta.fun/profile"
                        className={`bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm ${
                          validationErrors.dexsta ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''
                        }`}
                      />
                      {validationErrors.dexsta && (
                        <p className="text-sm text-red-600">{validationErrors.dexsta}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-purple-800 font-semibold flex items-center gap-2">
                        <Play className="w-4 h-4 text-purple-600" />
                        Spotify
                      </Label>
                      <Input
                        value={settings.myMusic.spotify}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings((prev) => ({ 
                          ...prev, 
                          myMusic: { ...prev.myMusic, spotify: e.target.value }
                        }))}
                        placeholder="https://open.spotify.com/artist/..."
                        className={`bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm ${
                          validationErrors.spotify ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''
                        }`}
                      />
                      {validationErrors.spotify && (
                        <p className="text-sm text-red-600">{validationErrors.spotify}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-purple-800 font-semibold flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-purple-600" />
                        SoundCloud
                      </Label>
                      <Input
                        value={settings.myMusic.soundcloud}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings((prev) => ({ 
                          ...prev, 
                          myMusic: { ...prev.myMusic, soundcloud: e.target.value }
                        }))}
                        placeholder="https://soundcloud.com/username"
                        className={`bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm ${
                          validationErrors.soundcloud ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''
                        }`}
                      />
                      {validationErrors.soundcloud && (
                        <p className="text-sm text-red-600">{validationErrors.soundcloud}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-purple-800 font-semibold flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-purple-600" />
                        YouTube
                      </Label>
                  <Input
                        value={settings.myMusic.youtube}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings((prev) => ({ 
                          ...prev, 
                          myMusic: { ...prev.myMusic, youtube: e.target.value }
                        }))}
                        placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                        className={`bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm ${
                          validationErrors.youtube ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''
                        }`}
                      />
                      {validationErrors.youtube && (
                        <p className="text-sm text-red-600">{validationErrors.youtube}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/50">
                  <p className="text-emerald-700 text-sm font-medium">
                    ✓ Reviewer mode is active. You can now review submissions in the Queue and History tabs.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        ) : (
          <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-xl flex items-center gap-2 font-heading">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  Payment Options
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Skip Line Prices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-purple-50/80 rounded-xl border border-purple-200/50">
                  <DollarSign className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <h3 className="font-semibold text-purple-900">USD Skip Price</h3>
                  <p className="text-2xl font-bold text-purple-900">${settings.skipLinePayments.skipPriceUsd}</p>
                </div>
                <div className="text-center p-4 bg-purple-50/80 rounded-xl border border-purple-200/50">
                  <Coins className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <h3 className="font-semibold text-purple-900">SEI Skip Price</h3>
                  <p className="text-2xl font-bold text-purple-900">{settings.skipLinePayments.skipPriceSei}</p>
                </div>
      </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Methods
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.skipLinePayments.cashapp && (
                    <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200/50">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-purple-800">CashApp</span>
                      </div>
                      <p className="text-purple-900">{settings.skipLinePayments.cashapp}</p>
                    </div>
                  )}
                  {settings.skipLinePayments.applePay && (
                    <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200/50">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-purple-800">Apple Pay</span>
                      </div>
                      <p className="text-purple-900">{settings.skipLinePayments.applePay}</p>
                    </div>
                  )}
                  {settings.skipLinePayments.sei && (
                    <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Coins className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-800">SEI Wallet</span>
                      </div>
                      <p className="text-purple-900 font-mono text-sm">{settings.skipLinePayments.sei}</p>
                    </div>
                  )}
                  {settings.skipLinePayments.freeSkips > 0 && (
                    <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Gift className="w-4 h-4 text-pink-600" />
                        <span className="font-medium text-purple-800">Free Skips</span>
                      </div>
                      <p className="text-purple-900">{settings.skipLinePayments.freeSkips} available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Music Links */}
              <div className="space-y-4">
                <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Music Platforms
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {settings.myMusic.dexsta && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(settings.myMusic.dexsta, "_blank")}
                      className="border-purple-300 text-purple-700 hover:bg-purple-100 rounded-xl h-12 justify-start"
                    >
                      <Music className="w-4 h-4 mr-3" />
                      Dexsta
                    </Button>
                  )}
                  {settings.myMusic.spotify && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(settings.myMusic.spotify, "_blank")}
                      className="border-purple-300 text-purple-700 hover:bg-purple-100 rounded-xl h-12 justify-start"
                    >
                      <Play className="w-4 h-4 mr-3" />
                      Spotify
                    </Button>
                  )}
                  {settings.myMusic.soundcloud && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(settings.myMusic.soundcloud, "_blank")}
                      className="border-purple-300 text-purple-700 hover:bg-purple-100 rounded-xl h-12 justify-start"
                    >
                      <Headphones className="w-4 h-4 mr-3" />
                      SoundCloud
                    </Button>
                  )}
                  {settings.myMusic.youtube && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(settings.myMusic.youtube, "_blank")}
                      className="border-purple-300 text-purple-700 hover:bg-purple-100 rounded-xl h-12 justify-start"
                    >
                      <Youtube className="w-4 h-4 mr-3" />
                      YouTube
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      )}

      {/* Payment Options - Show for all profiles */}
      {!isOwnProfile && (
        <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="px-6 pt-6 pb-4">
            <CardTitle className="text-xl flex items-center gap-2 font-heading">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                Payment Options
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Skip Line Prices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-50/80 rounded-xl border border-purple-200/50">
                <DollarSign className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <h3 className="font-semibold text-purple-900">USD Skip Price</h3>
                <p className="text-2xl font-bold text-purple-900">${settings.skipLinePayments.skipPriceUsd}</p>
              </div>
              <div className="text-center p-4 bg-purple-50/80 rounded-xl border border-purple-200/50">
                <Coins className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <h3 className="font-semibold text-purple-900">SEI Skip Price</h3>
                <p className="text-2xl font-bold text-purple-900">{settings.skipLinePayments.skipPriceSei}</p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Methods
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-purple-800">CashApp</span>
                  </div>
                  <p className="text-purple-900">{settings.skipLinePayments.cashapp || "N/A"}</p>
                </div>
                <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-purple-800">Apple Pay</span>
                  </div>
                  <p className="text-purple-900">{settings.skipLinePayments.applePay || "N/A"}</p>
                </div>
                <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-800">SEI Wallet</span>
                  </div>
                  <p className="text-purple-900 font-mono text-sm">{settings.skipLinePayments.sei || "N/A"}</p>
                </div>
                <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-4 h-4 text-pink-600" />
                    <span className="font-medium text-purple-800">Free Skips</span>
                  </div>
                  <p className="text-purple-900">{settings.skipLinePayments.freeSkips || 0} available</p>
                </div>
              </div>
            </div>

            {/* Music Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                <Music className="w-4 h-4" />
                Music Platforms
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Music className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-800">Dexsta</span>
                  </div>
                  <p className="text-purple-900">{settings.myMusic.dexsta || "N/A"}</p>
                </div>
                <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Play className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-800">Spotify</span>
                  </div>
                  <p className="text-purple-900">{settings.myMusic.spotify || "N/A"}</p>
                </div>
                <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Headphones className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-800">SoundCloud</span>
                  </div>
                  <p className="text-purple-900">{settings.myMusic.soundcloud || "N/A"}</p>
                </div>
                <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Youtube className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-800">YouTube</span>
                  </div>
                  <p className="text-purple-900">{settings.myMusic.youtube || "N/A"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Submissions */}
      <Card className="bg-white/90 backdrop-blur-xl border-0 text-purple-900 shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="text-xl flex items-center gap-2 font-heading">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            My Submissions ({mySubmissions.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {mySubmissions.length === 0 ? (
            <div className="text-center py-8">
              <Music className="w-12 h-12 mx-auto text-purple-400 mb-3" />
              <p className="text-purple-700 font-medium">No submissions yet</p>
              <p className="text-sm text-purple-600/80">Your submitted songs will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mySubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 bg-purple-50/80 rounded-xl border border-purple-200/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      {submission.songArt ? (
                        <img
                          src={submission.songArt || "/placeholder.svg"}
                          alt={submission.songTitle}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Music className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900">{submission.songTitle}</h4>
                      <p className="text-sm text-purple-700">by {submission.artistName}</p>
                      {submission.songGenre && <p className="text-xs text-purple-600/80">{submission.songGenre}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            submission.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : submission.status === "reviewed"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {submission.status}
                        </Badge>
                        {submission.nftId && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                            NFT: {submission.nftId}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CustomButton variant="ghost" size="sm" onClick={() => window.open(submission.songLink, "_blank")}>
                      <ExternalLink className="w-4 h-4" />
                    </CustomButton>
                    <CustomButton variant="ghost" size="sm" onClick={() => openEditSubmission(submission)}>
                      <Edit className="w-4 h-4" />
                    </CustomButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Submission Modal */}
      <Dialog open={!!editingSubmission} onOpenChange={() => setEditingSubmission(null)}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl max-w-2xl">
          {editingSubmission && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4">
                <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2 font-heading">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Edit className="w-5 h-5 text-white" />
                  </div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500">
                    Edit Submission
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-purple-800 font-semibold">Artist Name</Label>
                    <Input
                      value={editForm.artistName || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm((prev) => ({ ...prev, artistName: e.target.value }))}
                      className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-purple-800 font-semibold">TikTok Name</Label>
                    <Input
                      value={editForm.tiktokName || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm((prev) => ({ ...prev, tiktokName: e.target.value }))}
                      className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-800 font-semibold">Song Title</Label>
                  <Input
                    value={editForm.songTitle || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm((prev) => ({ ...prev, songTitle: e.target.value }))}
                    className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-800 font-semibold">Song Link</Label>
                  <Input
                    value={editForm.songLink || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm((prev) => ({ ...prev, songLink: e.target.value }))}
                    className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-800 font-semibold">Song Story</Label>
                  <Textarea
                    value={editForm.songStory || ""}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditForm((prev) => ({ ...prev, songStory: e.target.value }))}
                    className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl min-h-[100px] focus:border-purple-400 focus:ring-purple-400/20 transition-all resize-none shadow-sm"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-800 font-semibold">Featuring</Label>
                  <Input
                    value={editForm.featuring || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm((prev) => ({ ...prev, featuring: e.target.value }))}
                    className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-800 font-semibold">Dexsta.fun NFT ID (Optional)</Label>
                  <Input
                    value={editForm.nftId || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm((prev) => ({ ...prev, nftId: e.target.value }))}
                    placeholder="Enter NFT ID if available"
                    className="bg-purple-50/80 border-purple-200/50 text-purple-900 placeholder:text-purple-400 rounded-2xl h-12 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <CustomButton variant="ghost" onClick={() => setEditingSubmission(null)} className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </CustomButton>
                  <CustomButton onClick={saveSubmissionEdit} variant="gradient">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </CustomButton>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl max-w-md">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2 font-heading">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-green-600 to-teal-500">
                Profile Saved!
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 px-6 pb-6">
            <div className="text-center">
              <p className="text-purple-700 text-lg font-medium mb-2">
                Your profile has been updated successfully
              </p>
              <p className="text-purple-600/80 text-sm">
                All your settings and preferences have been saved to the database.
              </p>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-8 py-2 rounded-xl font-semibold"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Great!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border-0 text-purple-900 shadow-2xl rounded-3xl max-w-md">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2 font-heading">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-pink-600 to-rose-500">
                Save Failed
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 px-6 pb-6">
            <div className="text-center">
              <p className="text-purple-700 text-lg font-medium mb-2">
                Failed to save your profile
              </p>
              <p className="text-purple-600/80 text-sm mb-4">
                {errorMessage}
              </p>
              <p className="text-purple-600/60 text-xs">
                Please check your internet connection and try again.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowErrorModal(false)}
                className="border-purple-300 text-purple-700 hover:bg-purple-100 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowErrorModal(false)
                  saveSettings()
                }}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl font-semibold"
              >
                <Save className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
