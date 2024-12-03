'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const routes = [
  {
    label: 'Image Compression',
    href: '/image-compression',
    icon: '🖼️'
  },
  // Future routes will be added here
  // {
  //   label: 'PDF Tools',
  //   href: '/pdf-tools',
  //   icon: '📄'
  // },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-gray-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">
            File Converter
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <span className="mr-3">{route.icon}</span>
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 