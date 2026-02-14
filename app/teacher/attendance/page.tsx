import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AttendanceForm } from '@/components/teacher/attendance-form'
import { AttendanceList } from '@/components/teacher/attendance-list'
import { Calendar } from 'lucide-react'

export default async function TeacherAttendancePage() {
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

  // Get recent attendance recorded by this teacher
  const { data: recentAttendance } = await supabase
    .from('attendance')
    .select('*, student:profiles(full_name), course:courses(name, code)')
    .eq('recorded_by', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Take Attendance</h1>
        <p className="text-muted-foreground mt-1">
          Record student attendance for your classes
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Attendance Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Record Attendance</CardTitle>
            <CardDescription>Mark attendance for a student</CardDescription>
          </CardHeader>
          <CardContent>
            {courses && courses.length > 0 ? (
              <AttendanceForm 
                courses={courses} 
                enrollments={enrollments || []} 
                teacherId={user.id}
              />
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No courses assigned</p>
                <p className="text-sm text-muted-foreground mt-1">You need to be assigned to courses first</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Records</CardTitle>
            <CardDescription>Attendance you have recently recorded</CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceList attendance={recentAttendance || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
