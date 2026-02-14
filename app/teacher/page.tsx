import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Users,
  BookOpen,
  BarChart3,
  Calendar,
  Heart,
  AlertTriangle,
  Bell,
} from 'lucide-react'

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch teacher data
  const [
    { data: profile },
    { data: courses },
    { data: recentGrades },
    { data: recentAttendance },
    { data: recentCheckins },
    { data: announcements },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('courses').select('*, enrollments:enrollments(count)').eq('teacher_id', user.id),
    supabase.from('grades').select('*, student:profiles(full_name), course:courses(name)').eq('recorded_by', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('attendance').select('*').eq('recorded_by', user.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('emotion_checkins').select('*, student:profiles(full_name)').order('checked_in_at', { ascending: false }).limit(10),
    supabase.from('announcements').select('*').eq('author_id', user.id).order('created_at', { ascending: false }).limit(3),
  ])

  // Calculate stats
  const totalCourses = courses?.length || 0
  const totalStudents = courses?.reduce((acc, c) => acc + (c.enrollments?.[0]?.count || 0), 0) || 0
  
  // Count students needing attention (sad, stressed, angry, tired emotions)
  const concerningEmotions = ['sad', 'stressed', 'angry', 'tired']
  const studentsNeedingAttention = recentCheckins?.filter(c => concerningEmotions.includes(c.emotion)).length || 0

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Welcome back, {profile?.full_name?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {"Here's an overview of your classes and students"}
        </p>
      </div>

      {/* Attention Alert */}
      {studentsNeedingAttention > 0 && (
        <Card className="mb-8 border-destructive/20 bg-destructive/5">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-foreground">Students Need Attention</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {studentsNeedingAttention} student(s) reported concerning emotions recently. Consider reaching out.
                </p>
              </div>
              <Link href="/teacher/wellbeing">
                <Button variant="destructive">View Details</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">My Courses</p>
                <p className="text-2xl font-bold">{totalCourses}</p>
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
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recent Grades</p>
                <p className="text-2xl font-bold">{recentGrades?.length || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Need Attention</p>
                <p className="text-2xl font-bold">{studentsNeedingAttention}</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${studentsNeedingAttention > 0 ? 'bg-destructive/10' : 'bg-accent/10'}`}>
                <Heart className={`w-5 h-5 ${studentsNeedingAttention > 0 ? 'text-destructive' : 'text-accent'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">My Courses</CardTitle>
              <CardDescription>Courses you are teaching</CardDescription>
            </div>
            <Link href="/teacher/courses">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {courses && courses.length > 0 ? (
              <div className="space-y-3">
                {courses.slice(0, 4).map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{course.name}</p>
                        <p className="text-xs text-muted-foreground">{course.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{course.enrollments?.[0]?.count || 0}</p>
                      <p className="text-xs text-muted-foreground">students</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No courses assigned yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Student Check-ins */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Student Well-being</CardTitle>
              <CardDescription>Recent emotion check-ins</CardDescription>
            </div>
            <Link href="/teacher/wellbeing">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentCheckins && recentCheckins.length > 0 ? (
              <div className="space-y-3">
                {recentCheckins.slice(0, 5).map((checkin) => {
                  const isConcerning = concerningEmotions.includes(checkin.emotion)
                  const emotionIcon = {
                    happy: '😊',
                    neutral: '😐',
                    sad: '😢',
                    stressed: '😰',
                    tired: '😴',
                    angry: '😠',
                  }[checkin.emotion]

                  return (
                    <div key={checkin.id} className={`flex items-center justify-between p-3 rounded-lg ${isConcerning ? 'bg-destructive/5' : 'bg-muted/50'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{emotionIcon}</span>
                        <div>
                          <p className="font-medium text-sm">{checkin.student?.full_name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{checkin.emotion}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(checkin.checked_in_at).toLocaleDateString()}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No check-ins yet</p>
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
              <Link href="/teacher/grades">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-transparent">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  <span>Record Grades</span>
                </Button>
              </Link>
              <Link href="/teacher/attendance">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-transparent">
                  <Calendar className="w-6 h-6 text-accent" />
                  <span>Take Attendance</span>
                </Button>
              </Link>
              <Link href="/teacher/wellbeing">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-transparent">
                  <Heart className="w-6 h-6 text-destructive" />
                  <span>Well-being Reports</span>
                </Button>
              </Link>
              <Link href="/teacher/announcements">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-transparent">
                  <Bell className="w-6 h-6 text-primary" />
                  <span>Post Announcement</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
