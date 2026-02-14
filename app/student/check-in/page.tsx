import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmotionCheckinForm } from '@/components/student/emotion-checkin-form'
import { EmotionHistory } from '@/components/student/emotion-history'

export default async function CheckInPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch today's check-in
  const today = new Date().toISOString().split('T')[0]
  const { data: todayCheckin } = await supabase
    .from('emotion_checkins')
    .select('*')
    .eq('student_id', user.id)
    .gte('checked_in_at', today)
    .order('checked_in_at', { ascending: false })
    .limit(1)
    .single()

  // Fetch emotion history
  const { data: history } = await supabase
    .from('emotion_checkins')
    .select('*')
    .eq('student_id', user.id)
    .order('checked_in_at', { ascending: false })
    .limit(14)

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Emotional Well-being Check-in
        </h1>
        <p className="text-muted-foreground mt-1">
          Take a moment to reflect on how you&apos;re feeling today
        </p>
      </div>

      <div className="grid gap-6">
        {/* Check-in Form or Today's Result */}
        <Card>
          <CardHeader>
            <CardTitle>{"Today's Check-in"}</CardTitle>
            <CardDescription>
              {todayCheckin 
                ? "You've already checked in today. Here's your reflection."
                : "How are you feeling right now? Select an emotion that best describes your current state."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmotionCheckinForm existingCheckin={todayCheckin} userId={user.id} />
          </CardContent>
        </Card>

        {/* Emotion History */}
        <Card>
          <CardHeader>
            <CardTitle>Your Emotion History</CardTitle>
            <CardDescription>Track your emotional patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <EmotionHistory history={history || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
