export type UserRole = 'student' | 'teacher' | 'admin'

export type EmotionType = 'happy' | 'neutral' | 'sad' | 'stressed' | 'tired' | 'angry'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  student_id?: string
  department?: string
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  code: string
  name: string
  description?: string
  teacher_id?: string
  semester?: string
  created_at: string
  teacher?: Profile
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  enrolled_at: string
  student?: Profile
  course?: Course
}

export interface Grade {
  id: string
  student_id: string
  course_id: string
  assessment_name: string
  score?: number
  max_score: number
  remarks?: string
  recorded_by?: string
  created_at: string
  course?: Course
  student?: Profile
}

export interface Attendance {
  id: string
  student_id: string
  course_id: string
  date: string
  status: AttendanceStatus
  recorded_by?: string
  created_at: string
  course?: Course
  student?: Profile
}

export interface EmotionCheckin {
  id: string
  student_id: string
  emotion: EmotionType
  reason?: string
  ai_analysis?: string
  ai_suggestions?: string
  checked_in_at: string
  student?: Profile
}

export interface Announcement {
  id: string
  title: string
  content: string
  author_id?: string
  target_role?: 'all' | 'student' | 'teacher'
  created_at: string
  author?: Profile
}

export interface AIInsight {
  id: string
  insight_type: 'student_summary' | 'class_summary' | 'risk_alert' | 'recommendation'
  target_id?: string
  content: string
  metadata?: Record<string, unknown>
  generated_at: string
}

export const EMOTIONS: { value: EmotionType; label: string; icon: string }[] = [
  { value: 'happy', label: 'Happy', icon: '😊' },
  { value: 'neutral', label: 'Neutral', icon: '😐' },
  { value: 'sad', label: 'Sad', icon: '😢' },
  { value: 'stressed', label: 'Stressed', icon: '😰' },
  { value: 'tired', label: 'Tired', icon: '😴' },
  { value: 'angry', label: 'Angry', icon: '😠' },
]

export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  teacher: 'Teacher',
  admin: 'Administrator',
}
