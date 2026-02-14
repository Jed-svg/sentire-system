'use server'

import { createClient } from '@/lib/supabase/server'
import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import type { EmotionType } from '@/lib/types'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function submitEmotionCheckin(formData: FormData) {
  const emotion = formData.get('emotion') as EmotionType
  const reason = formData.get('reason') as string
  const userId = formData.get('userId') as string

  if (!emotion || !userId) {
    return { error: 'Missing required fields' }
  }

  const supabase = await createClient()

  // Generate AI analysis and suggestions using Groq
  let analysis: string | null = null
  let suggestions: string | null = null

  try {
    const prompt = `You are a compassionate and supportive AI counselor helping college students with their emotional well-being. A student has just checked in with their daily emotion.

Emotion: ${emotion}
${reason ? `Their thoughts: "${reason}"` : 'They did not share additional context.'}

Please provide:
1. A brief, empathetic analysis of their emotional state (2-3 sentences). Validate their feelings and show understanding.
2. 3 practical, actionable suggestions to help them feel better or maintain their positive state. Make these specific to college students.

Format your response as:
ANALYSIS:
[Your analysis here]

SUGGESTIONS:
[Your suggestions here, numbered 1-3]

Keep your tone warm, supportive, and non-judgmental. If they're feeling negative emotions, acknowledge that it's okay to feel this way.`

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
    })

    // Parse the response
    const analysisMatch = text.match(/ANALYSIS:\s*([\s\S]*?)(?=SUGGESTIONS:|$)/i)
    const suggestionsMatch = text.match(/SUGGESTIONS:\s*([\s\S]*?)$/i)

    analysis = analysisMatch ? analysisMatch[1].trim() : null
    suggestions = suggestionsMatch ? suggestionsMatch[1].trim() : null
  } catch (error) {
    console.error('Error generating AI analysis:', error)
    // Continue without AI analysis if it fails
  }

  // Save to database
  const { error: dbError } = await supabase
    .from('emotion_checkins')
    .insert({
      student_id: userId,
      emotion,
      reason: reason || null,
      ai_analysis: analysis,
      ai_suggestions: suggestions,
    })

  if (dbError) {
    console.error('Database error:', dbError)
    return { error: 'Failed to save check-in. Please try again.' }
  }

  return {
    success: true,
    analysis,
    suggestions,
  }
}
