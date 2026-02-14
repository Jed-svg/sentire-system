import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users } from 'lucide-react'

export default async function TeacherCoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: courses } = await supabase
    .from('courses')
    .select('*, enrollments:enrollments(count)')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Courses</h1>
        <p className="text-muted-foreground mt-1">
          Manage courses you are teaching
        </p>
      </div>

      {courses && courses.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <CardDescription>{course.code}</CardDescription>
                    </div>
                  </div>
                  {course.semester && (
                    <Badge variant="secondary">{course.semester}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {course.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{course.enrollments?.[0]?.count || 0} students enrolled</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No courses assigned yet</p>
            <p className="text-sm text-muted-foreground mt-1">Contact your administrator to be assigned to courses</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
