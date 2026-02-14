import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, BookOpen, Mail } from 'lucide-react'

export default async function TeacherStudentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get courses taught by this teacher
  const { data: courses } = await supabase
    .from('courses')
    .select('id, name, code')
    .eq('teacher_id', user.id)

  const courseIds = courses?.map(c => c.id) || []

  // Get students enrolled in these courses
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, student:profiles(*), course:courses(name, code)')
    .in('course_id', courseIds.length > 0 ? courseIds : ['00000000-0000-0000-0000-000000000000'])

  // Group students by course
  const studentsByCourse = enrollments?.reduce((acc, enrollment) => {
    const courseId = enrollment.course_id
    if (!acc[courseId]) {
      acc[courseId] = {
        course: enrollment.course,
        students: [],
      }
    }
    acc[courseId].students.push(enrollment.student)
    return acc
  }, {} as Record<string, { course: { name: string; code: string }; students: typeof enrollments[0]['student'][] }>) || {}

  const totalStudents = new Set(enrollments?.map(e => e.student_id)).size

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Students</h1>
        <p className="text-muted-foreground mt-1">
          View students enrolled in your courses
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold">{totalStudents}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Courses</p>
                <p className="text-3xl font-bold">{courses?.length || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students by Course */}
      {Object.keys(studentsByCourse).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(studentsByCourse).map(([courseId, { course, students }]) => (
            <Card key={courseId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription>{course.code} - {students.length} student(s)</CardDescription>
                  </div>
                  <Badge variant="secondary">{students.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {students.map((student) => {
                    const initials = student.full_name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)

                    return (
                      <div key={student.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{student.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{student.student_id || student.email}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No students enrolled yet</p>
            <p className="text-sm text-muted-foreground mt-1">Students will appear here once they enroll in your courses</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
