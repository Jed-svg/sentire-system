'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle } from 'lucide-react'

interface AnnouncementFormProps {
  authorId: string
}

export function AnnouncementForm({ authorId }: AnnouncementFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [targetRole, setTargetRole] = useState<'all' | 'student' | 'teacher'>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()

    const { error: dbError } = await supabase.from('announcements').insert({
      title,
      content,
      target_role: targetRole,
      author_id: authorId,
    })

    if (dbError) {
      setError(dbError.message)
      setIsSubmitting(false)
      return
    }

    setSuccess(true)
    setTitle('')
    setContent('')
    setIsSubmitting(false)
    router.refresh()

    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-accent/20 bg-accent/5">
          <CheckCircle className="w-4 h-4 text-accent" />
          <AlertDescription className="text-accent">Announcement posted successfully!</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Announcement title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          placeholder="Write your announcement here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="min-h-[150px] resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="target">Target Audience</Label>
        <Select value={targetRole} onValueChange={(value) => setTargetRole(value as 'all' | 'student' | 'teacher')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Everyone</SelectItem>
            <SelectItem value="student">Students Only</SelectItem>
            <SelectItem value="teacher">Teachers Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Posting...
          </>
        ) : (
          'Post Announcement'
        )}
      </Button>
    </form>
  )
}
