"use client"

import { Music, Heart, Twitter, MessageCircle } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-white/5 backdrop-blur-xl border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-6">
          {/* Logo and Description */}
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-xl flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-white font-medium font-heading">dexsta</p>
              <p className="text-xs text-purple-200/60">Music reviews with a smile</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center sm:justify-start gap-4">
            <a 
              href="https://x.com/dexstadotfun" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-purple-200/60 hover:text-purple-200 text-sm transition-colors"
            >
              <Twitter className="w-4 h-4" />
              <span className="hidden sm:inline">@dexstadotfun</span>
              <span className="sm:hidden">X</span>
            </a>
            <a 
              href="https://discord.gg/x5KYusDzMQ" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-purple-200/60 hover:text-purple-200 text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Discord</span>
              <span className="sm:hidden">Discord</span>
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <Link 
                href="/terms" 
                className="text-purple-200/60 hover:text-purple-200 text-xs sm:text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                href="/privacy" 
                className="text-purple-200/60 hover:text-purple-200 text-xs sm:text-sm transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
            <div className="flex items-center gap-2 text-purple-200/60 text-xs sm:text-sm">
              <span>Made with</span>
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400 fill-current" />
              <span>for creators</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
