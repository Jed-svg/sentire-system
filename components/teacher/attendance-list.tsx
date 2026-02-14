'use client'

import { Badge } from '@/components/ui/badge'
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import type { AttendanceStatus } from '@/lib/types'

interface AttendanceRecord {
  id: string
  date: string
  status: AttendanceStatus
  created_at: string
  student: { full_name: string }
  course: { name: string; code: string }
}

interface AttendanceListProps {
  attendance: AttendanceRecord[]
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; icon: typeof CheckCircle; color: string }> = {
  present: { label: 'Present', icon: CheckCircle, color: 'text-accent' },
  absent: { label: 'Absent', icon: XCircle, color: 'text-destructive' },
  late: { label: 'Late', icon: Clock, color: 'text-chart-3' },
  excused: { label: 'Excused', icon: AlertCircle, color: 'text-primary' },
}

export function AttendanceList({ attendance }: AttendanceListProps) {
  if (attendance.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No attendance recorded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto">
      {attendance.map((record) => {
        const config = STATUS_CONFIG[record.status]
        const Icon = config.icon
        
        return (
          <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${config.color}`} />
              <div>
                <p className="font-medium text-sm">{record.student.full_name}</p>
                <p className="text-xs text-muted-foreground">{record.course.name}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className={config.color}>
                {config.label}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(record.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
