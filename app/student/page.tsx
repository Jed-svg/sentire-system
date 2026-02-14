import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Heart,
  BarChart3,
  Calendar,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { EmotionCheckinPrompt } from '@/components/student/emotion-checkin-prompt'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch student data
  const [
    { data: profile },
    { data: enrollments },
    { data: recentGrades },
    { data: recentAttendance },
    { data: todayCheckin },
    { data: announcements },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('enrollments').select('*, course:courses(*)').eq('student_id', user.id),
    supabase.from('grades').select('*, course:courses(name)').eq('student_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('attendance').select('*').eq('student_id', user.id).order('date', { ascending: false }).limit(10),
    supabase.from('emotion_checkins').select('*').eq('student_id', user.id).gte('checked_in_at', new Date().toISOString().split('T')[0]).limit(1),
    supabase.from('announcements').select('*, author:profiles(full_name)').or('target_role.eq.all,target_role.eq.student').order('created_at', { ascending: false }).limit(3),
  ])

  // Calculate stats
  const courseCount = enrollments?.length || 0
  const avgScore = recentGrades?.length 
    ? Math.round(recentGrades.reduce((acc, g) => acc + ((g.score || 0) / (g.max_score || 100)) * 100, 0) / recentGrades.length)
    : 0
  const attendanceRate = recentAttendance?.length 
    ? Math.round((recentAttendance.filter(a => a.status === 'present').length / recentAttendance.length) * 100)
    : 100
  const hasCheckedInToday = (todayCheckin?.length || 0) > 0

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Welcome back, {profile?.full_name?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {"Here's an overview of your academic progress"}
        </p>
      </div>

      {/* Emotion Check-in Prompt */}
      {!hasCheckedInToday && <EmotionCheckinPrompt />}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                <p className="text-2xl font-bold">{courseCount}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Grade</p>
                <p className="text-2xl font-bold">{avgScore}%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-2xl font-bold">{attendanceRate}%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Check-in</p>
                <p className="text-2xl font-bold">{hasCheckedInToday ? 'Done' : 'Pending'}</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasCheckedInToday ? 'bg-accent/10' : 'bg-destructive/10'}`}>
                {hasCheckedInToday ? (
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Grades */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Grades</CardTitle>
              <CardDescription>Your latest assessment scores</CardDescription>
            </div>
            <Link href="/student/grades">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentGrades && recentGrades.length > 0 ? (
              <div className="space-y-3">
                {recentGrades.map((grade) => (
                  <div key={grade.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{grade.assessment_name}</p>
                      <p className="text-xs text-muted-foreground">{grade.course?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">
                        {grade.score}/{grade.max_score}
                      </span>
                      {(grade.score || 0) / (grade.max_score || 100) >= 0.75 ? (
                        <TrendingUp className="w-4 h-4 text-accent" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-destructive rotate-180" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No grades recorded yet</p>
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Announcements</CardTitle>
              <CardDescription>Latest updates from your institution</CardDescription>
            </div>
            <Link href="/student/announcements">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {announcements && announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium text-sm">{announcement.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      By {announcement.author?.full_name} • {new Date(announcement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No announcements yet</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/student/check-in">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-transparent">
                  <Heart className="w-6 h-6 text-primary" />
                  <span>Daily Check-in</span>
                </Button>
              </Link>
              <Link href="/student/grades">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-transparent">
                  <BarChart3 className="w-6 h-6 text-accent" />
                  <span>View Grades</span>
                </Button>
              </Link>
              <Link href="/student/attendance">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-transparent">
                  <Calendar className="w-6 h-6 text-accent" />
                  <span>Attendance</span>
                </Button>
              </Link>
              <Link href="/student/courses">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-transparent">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <span>My Courses</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
