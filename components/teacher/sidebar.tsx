'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  Bell,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Heart,
} from 'lucide-react'
import type { Profile } from '@/lib/types'

interface TeacherSidebarProps {
  profile: Profile
}

const NAV_ITEMS = [
  { href: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/teacher/courses', icon: BookOpen, label: 'My Courses' },
  { href: '/teacher/students', icon: Users, label: 'Students' },
  { href: '/teacher/grades', icon: BarChart3, label: 'Grades' },
  { href: '/teacher/attendance', icon: Calendar, label: 'Attendance' },
  { href: '/teacher/wellbeing', icon: Heart, label: 'Student Well-being' },
  { href: '/teacher/announcements', icon: Bell, label: 'Announcements' },
]

export function TeacherSidebar({ profile }: TeacherSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const isActive = (href: string) => {
    if (href === '/teacher') return pathname === '/teacher'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">SENTIRE</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-sidebar-foreground"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-sidebar z-50
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-sidebar-border">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">SENTIRE</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile.full_name}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {profile.department || 'Teacher'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Content spacer for mobile header */}
      <div className="lg:hidden h-16" />
    </>
  )
}
