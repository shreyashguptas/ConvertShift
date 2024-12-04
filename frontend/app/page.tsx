import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { routes, comingSoonTools } from '@/config/routes'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl w-full space-y-8 text-center">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          {/* Active Tools */}
          {routes.map((route) => (
            <Link key={route.href} href={route.href} className="block">
              <Button
                variant="outline"
                className="relative w-full h-64 text-lg hover:bg-gray-50 hover:border-blue-500 transition-all p-0 overflow-hidden"
              >
                <div className="absolute inset-0 p-6 flex flex-col items-center">
                  <span className="text-3xl mb-3">{route.icon}</span>
                  <h2 className="text-xl font-medium mb-2">{route.label}</h2>
                  <p className="text-sm text-gray-600 font-normal leading-relaxed">{route.description}</p>
                </div>
              </Button>
            </Link>
          ))}

          {/* Coming Soon Tools */}
          {comingSoonTools.map((tool) => (
            <Button
              key={tool.label}
              variant="outline"
              disabled
              className="relative w-full h-64 text-lg opacity-60 cursor-not-allowed p-0 overflow-hidden"
            >
              <div className="absolute inset-0 p-6 flex flex-col items-center">
                <span className="text-3xl mb-3">{tool.icon}</span>
                <h2 className="text-xl font-medium mb-2">{tool.label}</h2>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mb-2">Coming Soon</span>
                <p className="text-sm text-gray-500 font-normal leading-relaxed">{tool.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
