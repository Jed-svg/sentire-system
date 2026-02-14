import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GradeForm } from '@/components/teacher/grade-form'
import { GradesList } from '@/components/teacher/grades-list'
import { BarChart3 } from 'lucide-react'

export default async function TeacherGradesPage() {
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
    .select('student_id, course_id, student:profiles(id, full_name, student_id)')
    .in('course_id', courseIds.length > 0 ? courseIds : ['00000000-0000-0000-0000-000000000000'])

  // Get recent grades recorded by this teacher
  const { data: recentGrades } = await supabase
    .from('grades')
    .select('*, student:profiles(full_name), course:courses(name, code)')
    .eq('recorded_by', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Record Grades</h1>
        <p className="text-muted-foreground mt-1">
          Add and manage student grades
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Grade Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add New Grade</CardTitle>
            <CardDescription>Record a grade for a student</CardDescription>
          </CardHeader>
          <CardContent>
            {courses && courses.length > 0 ? (
              <GradeForm 
                courses={courses} 
                enrollments={enrollments || []} 
                teacherId={user.id}
              />
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No courses assigned</p>
                <p className="text-sm text-muted-foreground mt-1">You need to be assigned to courses first</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Grades</CardTitle>
            <CardDescription>Grades you have recently recorded</CardDescription>
          </CardHeader>
          <CardContent>
            <GradesList grades={recentGrades || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
