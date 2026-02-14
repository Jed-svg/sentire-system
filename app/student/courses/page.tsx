import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, User, Calendar } from 'lucide-react'

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, course:courses(*, teacher:profiles(full_name))')
    .eq('student_id', user.id)
    .order('enrolled_at', { ascending: false })

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Courses</h1>
        <p className="text-muted-foreground mt-1">
          View all courses you are currently enrolled in
        </p>
      </div>

      {/* Course List */}
      {enrollments && enrollments.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{enrollment.course?.name}</CardTitle>
                      <CardDescription>{enrollment.course?.code}</CardDescription>
                    </div>
                  </div>
                  {enrollment.course?.semester && (
                    <Badge variant="secondary">{enrollment.course.semester}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {enrollment.course?.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {enrollment.course.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {enrollment.course?.teacher && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{enrollment.course.teacher.full_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">You are not enrolled in any courses yet</p>
            <p className="text-sm text-muted-foreground mt-1">Contact your administrator to enroll in courses</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
