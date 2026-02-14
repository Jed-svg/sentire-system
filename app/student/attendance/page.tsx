import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import type { AttendanceStatus } from '@/lib/types'

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; icon: typeof CheckCircle; color: string; bgColor: string }> = {
  present: { label: 'Present', icon: CheckCircle, color: 'text-accent', bgColor: 'bg-accent/10' },
  absent: { label: 'Absent', icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
  late: { label: 'Late', icon: Clock, color: 'text-chart-3', bgColor: 'bg-chart-3/10' },
  excused: { label: 'Excused', icon: AlertCircle, color: 'text-primary', bgColor: 'bg-primary/10' },
}

export default async function AttendancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*, course:courses(name, code)')
    .eq('student_id', user.id)
    .order('date', { ascending: false })

  // Calculate stats
  const totalRecords = attendance?.length || 0
  const presentCount = attendance?.filter(a => a.status === 'present').length || 0
  const absentCount = attendance?.filter(a => a.status === 'absent').length || 0
  const lateCount = attendance?.filter(a => a.status === 'late').length || 0
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 100

  // Group by month
  const attendanceByMonth = attendance?.reduce((acc, record) => {
    const date = new Date(record.date)
    const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' })
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(record)
    return acc
  }, {} as Record<string, typeof attendance>) || {}

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Attendance Record</h1>
        <p className="text-muted-foreground mt-1">
          Track your class attendance and punctuality
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-3xl font-bold">{attendanceRate}%</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${attendanceRate >= 80 ? 'bg-accent/10' : 'bg-destructive/10'}`}>
                <Calendar className={`w-6 h-6 ${attendanceRate >= 80 ? 'text-accent' : 'text-destructive'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-3xl font-bold text-accent">{presentCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-3xl font-bold text-destructive">{absentCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-3xl font-bold text-chart-3">{lateCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-chart-3/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      {Object.keys(attendanceByMonth).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(attendanceByMonth).map(([month, records]) => (
            <Card key={month}>
              <CardHeader>
                <CardTitle className="text-lg">{month}</CardTitle>
                <CardDescription>
                  {records?.filter(r => r.status === 'present').length || 0} present out of {records?.length || 0} classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {records?.map((record) => {
                    const config = STATUS_CONFIG[record.status as AttendanceStatus]
                    const Icon = config.icon
                    
                    return (
                      <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{record.course?.name}</p>
                            <p className="text-xs text-muted-foreground">{record.course?.code}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {new Date(record.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                          <Badge variant="outline" className={config.color}>
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No attendance records yet</p>
            <p className="text-sm text-muted-foreground mt-1">Your attendance will be recorded by your teachers</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
