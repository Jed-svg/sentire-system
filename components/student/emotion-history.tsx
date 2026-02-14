'use client'

import type { EmotionCheckin, EmotionType } from '@/lib/types'
import { EMOTIONS } from '@/lib/types'

interface EmotionHistoryProps {
  history: EmotionCheckin[]
}

const EMOTION_COLORS: Record<EmotionType, string> = {
  happy: 'bg-emotion-happy',
  neutral: 'bg-emotion-neutral',
  sad: 'bg-emotion-sad',
  stressed: 'bg-emotion-stressed',
  tired: 'bg-emotion-tired',
  angry: 'bg-emotion-angry',
}

export function EmotionHistory({ history }: EmotionHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No check-ins yet. Start your journey today!</p>
      </div>
    )
  }

  // Calculate emotion stats
  const emotionCounts = history.reduce((acc, checkin) => {
    acc[checkin.emotion] = (acc[checkin.emotion] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalCheckins = history.length
  const mostFrequent = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-muted/50">
          <p className="text-sm text-muted-foreground">Total Check-ins</p>
          <p className="text-2xl font-bold">{totalCheckins}</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/50">
          <p className="text-sm text-muted-foreground">Most Common</p>
          <p className="text-2xl font-bold capitalize">{mostFrequent[0]}</p>
        </div>
      </div>

      {/* Emotion Distribution */}
      <div>
        <p className="text-sm font-medium mb-3">Emotion Distribution</p>
        <div className="flex gap-2 flex-wrap">
          {EMOTIONS.map((emotion) => {
            const count = emotionCounts[emotion.value] || 0
            const percentage = totalCheckins > 0 ? Math.round((count / totalCheckins) * 100) : 0
            
            return (
              <div
                key={emotion.value}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${EMOTION_COLORS[emotion.value]}/20`}
              >
                <span>{emotion.icon}</span>
                <span className="text-sm font-medium">{percentage}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Check-ins */}
      <div>
        <p className="text-sm font-medium mb-3">Recent Check-ins</p>
        <div className="space-y-2">
          {history.slice(0, 7).map((checkin) => {
            const emotion = EMOTIONS.find(e => e.value === checkin.emotion)
            const date = new Date(checkin.checked_in_at)
            
            return (
              <div
                key={checkin.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
              >
                <div className={`w-10 h-10 rounded-lg ${EMOTION_COLORS[checkin.emotion as EmotionType]} flex items-center justify-center text-lg`}>
                  {emotion?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm capitalize">{checkin.emotion}</p>
                  {checkin.reason && (
                    <p className="text-xs text-muted-foreground truncate">{checkin.reason}</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
