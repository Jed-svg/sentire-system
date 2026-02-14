import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, User, Calendar } from 'lucide-react'

export default async function AnnouncementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*, author:profiles(full_name)')
    .or('target_role.eq.all,target_role.eq.student')
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Announcements</h1>
        <p className="text-muted-foreground mt-1">
          Stay updated with the latest news and updates
        </p>
      </div>

      {/* Announcements List */}
      {announcements && announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    <CardDescription className="flex items-center gap-3 mt-2">
                      {announcement.author && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {announcement.author.full_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(announcement.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </CardDescription>
                  </div>
                  {announcement.target_role === 'student' && (
                    <Badge variant="secondary">For Students</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 whitespace-pre-wrap">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No announcements yet</p>
            <p className="text-sm text-muted-foreground mt-1">Check back later for updates</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
