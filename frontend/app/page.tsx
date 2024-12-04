import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { routes, comingSoonTools } from '@/config/routes'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8 text-center">
        {/* Logo Section */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <Image
            src="/images/Logo.jpg"
            alt="ConvertShift Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Brand and Tagline */}
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          ConvertShift
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          One Tool, Every Format, Total Privacy
        </p>

        {/* Privacy Badge */}
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full inline-block mb-12">
          <p className="text-sm font-medium">
            🔒 Your files never leave your device
          </p>
        </div>

        {/* Conversion Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {/* Active Tools */}
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <Button
                variant="outline"
                className="w-full h-24 text-lg flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 hover:border-blue-500 transition-all"
              >
                <span className="text-2xl">{route.icon}</span>
                {route.label}
              </Button>
            </Link>
          ))}

          {/* Coming Soon Tools */}
          {comingSoonTools.map((tool) => (
            <Button
              key={tool.label}
              variant="outline"
              disabled
              className="w-full h-24 text-lg flex flex-col items-center justify-center space-y-2 opacity-60 cursor-not-allowed"
            >
              <span className="text-2xl">{tool.icon}</span>
              {tool.label}
              <span className="text-xs text-gray-500">Coming Soon</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
