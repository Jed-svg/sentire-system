'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle } from 'lucide-react'
import type { AttendanceStatus } from '@/lib/types'

interface AttendanceFormProps {
  courses: { id: string; name: string; code: string }[]
  enrollments: { student_id: string; course_id: string; student: { id: string; full_name: string; student_id: string } }[]
  teacherId: string
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'excused', label: 'Excused' },
]

export function AttendanceForm({ courses, enrollments, teacherId }: AttendanceFormProps) {
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState<AttendanceStatus>('present')
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

    const { error: dbError } = await supabase.from('attendance').upsert({
      student_id: selectedStudent,
      course_id: selectedCourse,
      date,
      status,
      recorded_by: teacherId,
    }, {
      onConflict: 'student_id,course_id,date',
    })

    if (dbError) {
      setError(dbError.message)
      setIsSubmitting(false)
      return
    }

    setSuccess(true)
    setSelectedStudent('')
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
          <AlertDescription className="text-accent">Attendance recorded successfully!</AlertDescription>
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
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as AttendanceStatus)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || !selectedCourse || !selectedStudent}>
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Recording...
          </>
        ) : (
          'Record Attendance'
        )}
      </Button>
    </form>
  )
}
