'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Sparkles } from 'lucide-react'

export function EmotionCheckinPrompt() {
  return (
    <Card className="mb-8 border-primary/20 bg-primary/5">
      <CardContent className="py-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-semibold text-foreground">How are you feeling today?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Take a moment to check in with yourself. Your well-being matters to us.
            </p>
          </div>
          <Link href="/student/check-in">
            <Button className="gap-2">
              <Sparkles className="w-4 h-4" />
              Check in now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
