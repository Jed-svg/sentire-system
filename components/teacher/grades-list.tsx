'use client'

import { Badge } from '@/components/ui/badge'
import { BarChart3 } from 'lucide-react'

interface Grade {
  id: string
  assessment_name: string
  score: number
  max_score: number
  created_at: string
  student: { full_name: string }
  course: { name: string; code: string }
}

interface GradesListProps {
  grades: Grade[]
}

export function GradesList({ grades }: GradesListProps) {
  if (grades.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No grades recorded yet</p>
      </div>
    )
  }

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return 'text-accent'
    if (percentage >= 75) return 'text-primary'
    if (percentage >= 60) return 'text-chart-3'
    return 'text-destructive'
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto">
      {grades.map((grade) => (
        <div key={grade.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{grade.student.full_name}</p>
            <p className="text-xs text-muted-foreground">{grade.assessment_name}</p>
            <p className="text-xs text-muted-foreground">{grade.course.name}</p>
          </div>
          <div className="text-right ml-4">
            <p className={`font-bold ${getGradeColor(grade.score, grade.max_score)}`}>
              {grade.score}/{grade.max_score}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(grade.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
