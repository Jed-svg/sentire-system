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

interface GradeFormProps {
  courses: { id: string; name: string; code: string }[]
  enrollments: { student_id: string; course_id: string; student: { id: string; full_name: string; student_id: string } }[]
  teacherId: string
}

export function GradeForm({ courses, enrollments, teacherId }: GradeFormProps) {
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [assessmentName, setAssessmentName] = useState('')
  const [score, setScore] = useState('')
  const [maxScore, setMaxScore] = useState('100')
  const [remarks, setRemarks] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Filter students based on selected course
  const availableStudents = enrollments.filter(e => e.course_id === selectedCourse)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()

    const { error: dbError } = await supabase.from('grades').insert({
      student_id: selectedStudent,
      course_id: selectedCourse,
      assessment_name: assessmentName,
      score: parseFloat(score),
      max_score: parseFloat(maxScore),
      remarks: remarks || null,
      recorded_by: teacherId,
    })

    if (dbError) {
      setError(dbError.message)
      setIsSubmitting(false)
      return
    }

    setSuccess(true)
    setSelectedStudent('')
    setAssessmentName('')
    setScore('')
    setRemarks('')
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
          <AlertDescription className="text-accent">Grade recorded successfully!</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="course">Course</Label>
        <Select value={selectedCourse} onValueChange={(value) => { setSelectedCourse(value); setSelectedStudent('') }}>
          <SelectTrigger>
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name} ({course.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="student">Student</Label>
        <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={!selectedCourse}>
          <SelectTrigger>
            <SelectValue placeholder={selectedCourse ? 'Select a student' : 'Select a course first'} />
          </SelectTrigger>
          <SelectContent>
            {availableStudents.map((enrollment) => (
              <SelectItem key={enrollment.student_id} value={enrollment.student_id}>
                {enrollment.student.full_name} ({enrollment.student.student_id || 'No ID'})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assessment">Assessment Name</Label>
        <Input
          id="assessment"
          placeholder="e.g., Midterm Exam, Quiz 1"
          value={assessmentName}
          onChange={(e) => setAssessmentName(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="score">Score</Label>
          <Input
            id="score"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxScore">Max Score</Label>
          <Input
            id="maxScore"
            type="number"
            min="1"
            step="0.01"
            placeholder="100"
            value={maxScore}
            onChange={(e) => setMaxScore(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks (Optional)</Label>
        <Textarea
          id="remarks"
          placeholder="Any additional comments..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="resize-none"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || !selectedCourse || !selectedStudent}>
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Recording...
          </>
        ) : (
          'Record Grade'
        )}
      </Button>
    </form>
  )
}
