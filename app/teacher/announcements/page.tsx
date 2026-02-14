import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnnouncementForm } from '@/components/teacher/announcement-form'
import { Badge } from '@/components/ui/badge'
import { Bell, Calendar, User } from 'lucide-react'

export default async function TeacherAnnouncementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get announcements by this teacher
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Announcements</h1>
        <p className="text-muted-foreground mt-1">
          Post announcements for your students
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* New Announcement Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Post New Announcement</CardTitle>
            <CardDescription>Share important updates with students</CardDescription>
          </CardHeader>
          <CardContent>
            <AnnouncementForm authorId={user.id} />
          </CardContent>
        </Card>

        {/* Previous Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Announcements</CardTitle>
            <CardDescription>Previously posted announcements</CardDescription>
          </CardHeader>
          <CardContent>
            {announcements && announcements.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium">{announcement.title}</h3>
                      {announcement.target_role && (
                        <Badge variant="secondary" className="shrink-0">
                          {announcement.target_role === 'all' ? 'Everyone' : announcement.target_role}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(announcement.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No announcements yet</p>
                <p className="text-sm text-muted-foreground mt-1">Post your first announcement to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
