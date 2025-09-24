"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Music, LogOut, User, ChevronDown, Settings, ExternalLink } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface User {
  username: string
  email: string
  id: string
}

interface HeaderProps {
  user?: User
  onLogout?: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [userTiktokHandle, setUserTiktokHandle] = useState<string>("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch user's TikTok handle from database
  useEffect(() => {
    if (!user?.id) return

    const fetchUserTiktokHandle = async () => {
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('tiktok_handle')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error loading TikTok handle:', error)
          // Fall back to localStorage
          const storedSettings = localStorage.getItem(`userSettings_${user.id}`)
          if (storedSettings) {
            const settings = JSON.parse(storedSettings)
            setUserTiktokHandle(settings.tiktokHandle || '')
          }
        } else if (profileData?.tiktok_handle) {
          setUserTiktokHandle(profileData.tiktok_handle.replace('@', ''))
        }
      } catch (error) {
        console.error('Error fetching TikTok handle:', error)
        // Fall back to localStorage
        const storedSettings = localStorage.getItem(`userSettings_${user.id}`)
        if (storedSettings) {
          const settings = JSON.parse(storedSettings)
          setUserTiktokHandle(settings.tiktokHandle || '')
        }
      }
    }

    fetchUserTiktokHandle()
  }, [user?.id])

  const handleLogout = async () => {
    if (!onLogout) return
    
    setIsLoggingOut(true)
    try {
      await onLogout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-2xl flex items-center justify-center shadow-lg">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-heading">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                  dexsta
                </span>
              </h1>
              <p className="text-xs text-purple-200/60">Music Review Hub</p>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <Button 
              variant="ghost" 
              className="flex items-center gap-3 text-white hover:bg-white/20 rounded-xl px-4 py-3"
              onClick={() => {
                console.log('Button clicked')
                setIsOpen(!isOpen)
              }}
            >
              <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold">{user?.username || 'Guest'}</p>
                <p className="text-xs text-purple-200/70">{user?.email || 'Not signed in'}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-purple-200/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
            
            {isOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 shadow-lg rounded-lg z-50">
                {user ? (
                  <>
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-1">
                      <Link 
                        href={userTiktokHandle ? `/${userTiktokHandle}` : "/review?tab=settings"} 
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        {userTiktokHandle ? "My Profile" : "Profile & Settings"}
                      </Link>
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          handleLogout()
                        }}
                        disabled={isLoggingOut}
                        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md cursor-pointer w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        {isLoggingOut ? "Signing out..." : "Sign out"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">Not signed in</p>
                      <Link 
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Sign In
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
