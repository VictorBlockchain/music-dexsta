"use client"

import { Music, Heart } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-white/5 backdrop-blur-xl border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo and Description */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-xl flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-medium font-heading">dexsta</p>
              <p className="text-xs text-purple-200/60">Music reviews with a smile</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link 
              href="/terms" 
              className="text-purple-200/60 hover:text-purple-200 text-sm transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              href="/privacy" 
              className="text-purple-200/60 hover:text-purple-200 text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <div className="flex items-center gap-2 text-purple-200/60 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-pink-400 fill-current" />
              <span>for creators</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
