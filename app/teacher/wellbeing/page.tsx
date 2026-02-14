import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Heart, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import type { EmotionType } from '@/lib/types'
import { EMOTIONS } from '@/lib/types'

const EMOTION_COLORS: Record<EmotionType, string> = {
  happy: 'bg-emotion-happy',
  neutral: 'bg-emotion-neutral',
  sad: 'bg-emotion-sad',
  stressed: 'bg-emotion-stressed',
  tired: 'bg-emotion-tired',
  angry: 'bg-emotion-angry',
}

export default async function TeacherWellbeingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get courses taught by this teacher
  const { data: courses } = await supabase
    .from('courses')
    .select('id')
    .eq('teacher_id', user.id)

  const courseIds = courses?.map(c => c.id) || []

  // Get students enrolled in these courses
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('student_id')
    .in('course_id', courseIds.length > 0 ? courseIds : ['00000000-0000-0000-0000-000000000000'])

  const studentIds = [...new Set(enrollments?.map(e => e.student_id) || [])]

  // Get recent emotion check-ins from these students
  const { data: checkins } = await supabase
    .from('emotion_checkins')
    .select('*, student:profiles(full_name, student_id)')
    .in('student_id', studentIds.length > 0 ? studentIds : ['00000000-0000-0000-0000-000000000000'])
    .order('checked_in_at', { ascending: false })
    .limit(50)

  // Calculate stats
  const concerningEmotions = ['sad', 'stressed', 'angry', 'tired']
  const studentsNeedingAttention = checkins?.filter(c => concerningEmotions.includes(c.emotion)) || []
  const uniqueStudentsNeedingAttention = [...new Set(studentsNeedingAttention.map(c => c.student_id))]

  // Emotion distribution
  const emotionCounts = checkins?.reduce((acc, checkin) => {
    acc[checkin.emotion] = (acc[checkin.emotion] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const totalCheckins = checkins?.length || 0

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Student Well-being</h1>
        <p className="text-muted-foreground mt-1">
          Monitor the emotional well-being of your students
        </p>
      </div>

      {/* Alert for students needing attention */}
      {uniqueStudentsNeedingAttention.length > 0 && (
        <Alert className="mb-8 border-destructive/20 bg-destructive/5">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <AlertTitle className="text-destructive">Students Need Attention</AlertTitle>
          <AlertDescription className="text-foreground/80">
            {uniqueStudentsNeedingAttention.length} student(s) have reported concerning emotions recently. 
            Consider reaching out to check on their well-being.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Check-ins</p>
                <p className="text-3xl font-bold">{totalCheckins}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Positive</p>
                <p className="text-3xl font-bold text-accent">
                  {(emotionCounts['happy'] || 0) + (emotionCounts['neutral'] || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concerning</p>
                <p className="text-3xl font-bold text-destructive">
                  {studentsNeedingAttention.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Students Flagged</p>
                <p className="text-3xl font-bold">{uniqueStudentsNeedingAttention.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Emotion Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Emotion Distribution</CardTitle>
            <CardDescription>Overview of all student check-ins</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {EMOTIONS.map((emotion) => {
                const count = emotionCounts[emotion.value] || 0
                const percentage = totalCheckins > 0 ? Math.round((count / totalCheckins) * 100) : 0
                
                return (
                  <div key={emotion.value} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${EMOTION_COLORS[emotion.value]} flex items-center justify-center text-lg`}>
                      {emotion.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{emotion.label}</span>
                        <span className="text-sm text-muted-foreground">{count} ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${EMOTION_COLORS[emotion.value]} transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Students Needing Attention */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Students Needing Attention</CardTitle>
            <CardDescription>Recent concerning check-ins</CardDescription>
          </CardHeader>
          <CardContent>
            {studentsNeedingAttention.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {studentsNeedingAttention.slice(0, 10).map((checkin) => {
                  const emotion = EMOTIONS.find(e => e.value === checkin.emotion)
                  
                  return (
                    <div key={checkin.id} className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5">
                      <div className={`w-10 h-10 rounded-lg ${EMOTION_COLORS[checkin.emotion as EmotionType]} flex items-center justify-center text-lg`}>
                        {emotion?.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{checkin.student?.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {checkin.reason || `Feeling ${checkin.emotion}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-destructive">
                          {emotion?.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(checkin.checked_in_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-accent mx-auto mb-4" />
                <p className="text-muted-foreground">All students seem to be doing well!</p>
                <p className="text-sm text-muted-foreground mt-1">No concerning emotions reported recently</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
