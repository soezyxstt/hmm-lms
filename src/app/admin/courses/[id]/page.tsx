// ~/app/admin/courses/[id]/page.tsx
import { api } from '~/trpc/server';
import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Users,
  FileText,
  ClipboardList,
  Eye,
  Download,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import CourseSettings from './course-settings';
import MembersManagement from './members-management';
import DocumentsManagement from './documents-management';
import CourseAnalytics from './course-analytics';
import UploadDocument from './upload-document';

interface CourseAdminPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseAdminPage({ params }: CourseAdminPageProps) {
  try {
    const { id } = await params;
    const [course, analytics] = await Promise.all([
      api.course.getCourseForAdmin({ id }),
      api.course.getCourseAnalytics({ id }),
    ]);

    const formattedAnalytics = {
      ...analytics,
      memberStats: (analytics.memberStats as { date: string; count: number }[]),
    };

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="bg-purple-600">
                  Admin Panel
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {course.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {course.description ?? 'No description available'}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {course._count.members} members
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {course._count.document} documents
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <ClipboardList className="h-3 w-3" />
                  {course._count.tryout} tryouts
                </Badge>
                <Badge variant="outline">
                  {course.classCode}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={`/courses/${course.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Course
                </Link>
              </Button>
              <UploadDocument courseId={course.id} />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{course._count.members}</div>
              <p className="text-xs text-muted-foreground">
                Active enrollments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{course._count.document}</div>
              <p className="text-xs text-muted-foreground">
                Total uploads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {course.document.reduce((sum, doc) => sum + doc.views, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Document views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {course.document.reduce((sum, doc) => sum + doc.downloads, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total downloads
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="tryouts">Tryouts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{activity.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.action.toLowerCase()}ed &quot;{activity.document.title}&quot;
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(activity.accessedAt)} ago
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Announcements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.announcements.slice(0, 5).map((announcement) => (
                    <div key={announcement.id} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-sm">{announcement.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {announcement.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        By {announcement.createdBy.name} • {formatDistanceToNow(announcement.createdAt)} ago
                      </p>
                    </div>
                  ))}
                  {course.announcements.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No announcements yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members">
            <MembersManagement course={course} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsManagement course={course} />
          </TabsContent>

          <TabsContent value="tryouts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Tryouts Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.tryout.map((tryout) => (
                    <div key={tryout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{tryout.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {tryout._count.questions} questions • {tryout._count.attempts} attempts
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created {formatDistanceToNow(tryout.createdAt)} ago
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={tryout.isActive ? "default" : "secondary"}>
                          {tryout.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/tryouts/${tryout.id}`}>
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {course.tryout.length === 0 && (
                    <div className="text-center py-8">
                      <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No tryouts created yet</p>
                      <Button className="mt-4" asChild>
                        <Link href={`/admin/tryouts/create?courseId=${course.id}`}>
                          Create Tryout
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <CourseAnalytics analytics={formattedAnalytics} />
          </TabsContent>

          <TabsContent value="settings">
            <CourseSettings course={course} />
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch {
    notFound();
  }
}

export async function generateMetadata({ params }: CourseAdminPageProps) {
  try {
    const { id } = await params;
    const course = await api.course.getCourseForAdmin({ id });
    return {
      title: `${course.title} - Admin Panel`,
      description: `Manage ${course.title} course`,
    };
  } catch {
    return {
      title: 'Course Admin - Not Found',
    };
  }
}