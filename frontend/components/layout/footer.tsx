'use client'

import { Github, Heart } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white py-3 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-3">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span>© {new Date().getFullYear()} ConvertShift</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">One Tool, Every Format, Total Privacy</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Built by Shreyash Gupta</span>
          <Link 
            href="https://ko-fi.com/shreyashgupta" 
            target="_blank"
            className="flex items-center gap-1 hover:text-gray-900 transition-colors"
          >
            <Heart className="h-4 w-4 text-red-500" />
            <span>Support</span>
          </Link>
          <Link 
            href="https://github.com/shreyashgupta/file-converter" 
            target="_blank"
            className="flex items-center gap-1 hover:text-gray-900 transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </Link>
        </div>
      </div>
    </footer>
  )
} 