import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Award } from 'lucide-react'

export default async function GradesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: grades } = await supabase
    .from('grades')
    .select('*, course:courses(name, code)')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  // Group grades by course
  const gradesByCourse = grades?.reduce((acc, grade) => {
    const courseId = grade.course_id
    if (!acc[courseId]) {
      acc[courseId] = {
        course: grade.course,
        grades: [],
      }
    }
    acc[courseId].grades.push(grade)
    return acc
  }, {} as Record<string, { course: { name: string; code: string }; grades: typeof grades }>) || {}

  // Calculate overall stats
  const totalGrades = grades?.length || 0
  const avgScore = totalGrades > 0
    ? Math.round(grades!.reduce((acc, g) => acc + ((g.score || 0) / (g.max_score || 100)) * 100, 0) / totalGrades)
    : 0

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return 'text-accent'
    if (percentage >= 75) return 'text-primary'
    if (percentage >= 60) return 'text-chart-3'
    return 'text-destructive'
  }

  const getGradeLetter = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return 'A'
    if (percentage >= 80) return 'B'
    if (percentage >= 70) return 'C'
    if (percentage >= 60) return 'D'
    return 'F'
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Grades</h1>
        <p className="text-muted-foreground mt-1">
          Track your academic performance across all courses
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Average</p>
                <p className="text-3xl font-bold">{avgScore}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {avgScore >= 75 ? (
                  <TrendingUp className="w-6 h-6 text-accent" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-destructive" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assessments</p>
                <p className="text-3xl font-bold">{totalGrades}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Courses with Grades</p>
                <p className="text-3xl font-bold">{Object.keys(gradesByCourse).length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grades by Course */}
      {Object.keys(gradesByCourse).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(gradesByCourse).map(([courseId, { course, grades: courseGrades }]) => {
            const courseAvg = Math.round(
              courseGrades.reduce((acc, g) => acc + ((g.score || 0) / (g.max_score || 100)) * 100, 0) / courseGrades.length
            )
            
            return (
              <Card key={courseId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <CardDescription>{course.code}</CardDescription>
                    </div>
                    <Badge variant={courseAvg >= 75 ? 'default' : 'secondary'} className="text-lg px-3 py-1">
                      {courseAvg}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {courseGrades.map((grade) => (
                      <div key={grade.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-sm">{grade.assessment_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(grade.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-lg font-bold ${getGradeColor(grade.score || 0, grade.max_score || 100)}`}>
                            {grade.score}/{grade.max_score}
                          </span>
                          <Badge variant="outline">
                            {getGradeLetter(grade.score || 0, grade.max_score || 100)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No grades recorded yet</p>
            <p className="text-sm text-muted-foreground mt-1">Your grades will appear here once they are recorded by your teachers</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
