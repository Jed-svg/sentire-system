'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, Sparkles, Brain, Lightbulb, RefreshCw } from 'lucide-react'
import type { EmotionCheckin, EmotionType } from '@/lib/types'
import { EMOTIONS } from '@/lib/types'
import { submitEmotionCheckin } from '@/app/student/check-in/actions'

interface EmotionCheckinFormProps {
  existingCheckin: EmotionCheckin | null
  userId: string
}

const EMOTION_COLORS: Record<EmotionType, string> = {
  happy: 'bg-emotion-happy',
  neutral: 'bg-emotion-neutral',
  sad: 'bg-emotion-sad',
  stressed: 'bg-emotion-stressed',
  tired: 'bg-emotion-tired',
  angry: 'bg-emotion-angry',
}

export function EmotionCheckinForm({ existingCheckin, userId }: EmotionCheckinFormProps) {
  const router = useRouter()
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(
    existingCheckin?.emotion as EmotionType || null
  )
  const [reason, setReason] = useState(existingCheckin?.reason || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{
    analysis: string | null
    suggestions: string | null
  } | null>(
    existingCheckin ? {
      analysis: existingCheckin.ai_analysis,
      suggestions: existingCheckin.ai_suggestions,
    } : null
  )
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!selectedEmotion) {
      setError('Please select an emotion')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.append('emotion', selectedEmotion)
    formData.append('reason', reason)
    formData.append('userId', userId)

    const response = await submitEmotionCheckin(formData)

    if (response.error) {
      setError(response.error)
      setIsSubmitting(false)
      return
    }

    setResult({
      analysis: response.analysis || null,
      suggestions: response.suggestions || null,
    })
    setIsSubmitting(false)
    router.refresh()
  }

  if (result) {
    return (
      <div className="space-y-6">
        {/* Selected Emotion Display */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
          <div className={`w-16 h-16 rounded-2xl ${EMOTION_COLORS[selectedEmotion!]} flex items-center justify-center text-3xl`}>
            {EMOTIONS.find(e => e.value === selectedEmotion)?.icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">You&apos;re feeling</p>
            <p className="text-xl font-semibold capitalize">{selectedEmotion}</p>
            {reason && (
              <p className="text-sm text-muted-foreground mt-1">&quot;{reason}&quot;</p>
            )}
          </div>
        </div>

        {/* AI Analysis */}
        {result.analysis && (
          <Alert className="border-primary/20 bg-primary/5">
            <Brain className="w-4 h-4 text-primary" />
            <AlertTitle className="text-primary">AI Analysis</AlertTitle>
            <AlertDescription className="text-foreground/80 mt-2 whitespace-pre-wrap">
              {result.analysis}
            </AlertDescription>
          </Alert>
        )}

        {/* AI Suggestions */}
        {result.suggestions && (
          <Alert className="border-accent/20 bg-accent/5">
            <Lightbulb className="w-4 h-4 text-accent" />
            <AlertTitle className="text-accent">Suggestions for You</AlertTitle>
            <AlertDescription className="text-foreground/80 mt-2 whitespace-pre-wrap">
              {result.suggestions}
            </AlertDescription>
          </Alert>
        )}

        {existingCheckin && (
          <p className="text-sm text-muted-foreground text-center">
            You can check in again tomorrow. Take care of yourself!
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Emotion Selection */}
      <div className="space-y-3">
        <Label>Select how you&apos;re feeling</Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {EMOTIONS.map((emotion) => {
            const isSelected = selectedEmotion === emotion.value
            
            return (
              <button
                key={emotion.value}
                type="button"
                onClick={() => setSelectedEmotion(emotion.value)}
                disabled={isSubmitting}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                  ${isSelected 
                    ? `border-primary ${EMOTION_COLORS[emotion.value]}/20` 
                    : 'border-border hover:border-primary/50'
                  }
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <span className="text-3xl">{emotion.icon}</span>
                <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                  {emotion.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Reason Input */}
      <div className="space-y-2">
        <Label htmlFor="reason">
          What&apos;s on your mind? <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Textarea
          id="reason"
          placeholder="Share what's contributing to how you feel today..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isSubmitting}
          className="min-h-[100px] resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!selectedEmotion || isSubmitting}
        className="w-full gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing with AI...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Submit Check-in
          </>
        )}
      </Button>
    </div>
  )
}
