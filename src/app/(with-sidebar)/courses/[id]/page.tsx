// ~/app/courses/[id]/page.tsx
import { api } from '~/trpc/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import {
  BookOpen,
  FileText,
  Video,
  ClipboardList,
  Users,
  // Calendar,
  Clock,
  Award,
  CheckCircle,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import EnrollButton from '../enroll-button';
import CoursePreview from '../course-preview';
import DocumentViewer from '~/components/document-viewer';
import VideoViewer from '~/components/video-viewer';

interface CoursePageProps {
  params: Promise<{
    id: string;
  }>;
}
export default async function DetailedCoursePage({ params }: CoursePageProps) {
  try {
    const { id } = await params;
    const course = await api.course.getCourseById({ id });
    const canAccessContent = course.isEnrolled

    // If user cannot access content (not enrolled and not admin), show preview
    if (!canAccessContent) {
      return (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {course.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {course.description ?? 'No description available'}
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {course._count.members} students
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
              <div className="flex-shrink-0">
                <EnrollButton courseId={course.id} courseName={course.title} />
              </div>
            </div>
          </div>

          {/* Course Preview */}
          <CoursePreview course={course} />
        </div>
      );
    }

    const materials = await api.course.getCourseMaterials({ id });

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className={`rounded-lg p-6 ${course.isAdmin
            ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20'
            : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'
          }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {course.isAdmin ? (
                  <>
                    <Crown className="h-5 w-5 text-purple-600" />
                    <Badge variant="default" className="bg-purple-600">
                      Admin Access
                    </Badge>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <Badge variant="default" className="bg-green-600">
                      Enrolled
                    </Badge>
                  </>
                )}
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
                  {course._count.members} students
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
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="tryouts">Tryouts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">E-books</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{materials.ebooks.length}</div>
                  <p className="text-xs text-muted-foreground">Available resources</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Videos</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{materials.videos.length}</div>
                  <p className="text-xs text-muted-foreground">Learning videos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tryouts</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{course.tryout.length}</div>
                  <p className="text-xs text-muted-foreground">Practice tests</p>
                </CardContent>
              </Card>
            </div>

            {course.announcements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Announcements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.announcements.map((announcement) => (
                    <div key={announcement.id} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold">{announcement.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {announcement.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        By {announcement.createdBy.name} • {formatDistanceToNow(announcement.createdAt)} ago
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    E-books & Reading Materials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {materials.ebooks.map((ebook) => (
                      <DocumentViewer
                        key={ebook.id}
                        document={ebook}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Presentations & Slides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {materials.presentations.map((presentation) => (
                      <DocumentViewer
                        key={presentation.id}
                        document={presentation}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Learning Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {materials.videos.map((video) => (
                    <VideoViewer
                      key={video.id}
                      video={video}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Previous Exams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {materials.previousExams.map((exam) => (
                    <DocumentViewer
                      key={exam.id}
                      document={exam}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tryouts" className="space-y-6">
            <div className="grid gap-4">
              {course.tryout.map((tryout) => (
                <Card key={tryout.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          {tryout.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {tryout.description ?? 'No description available'}
                        </CardDescription>
                      </div>
                      <Badge variant={tryout.isActive ? "default" : "secondary"}>
                        {tryout.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground max-sm:text-xs">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {tryout.duration ? `${tryout.duration} minutes` : 'No time limit'}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClipboardList className="h-4 w-4" />
                          {tryout._count.questions} questions
                        </span>
                        <span className="flex items-center gap-1 max-sm:hidden">
                          <Users className="h-4 w-4" />
                          {tryout._count.attempts} attempts
                        </span>
                      </div>
                      <Button asChild disabled={!tryout.isActive}>
                        <Link href={`/tryouts/${tryout.id}`} className='text-sm'>
                          Start Tryout
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {course.tryout.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No tryouts available yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch {
    // notFound();
  }
}

export async function generateMetadata({ params }: CoursePageProps) {
  try {
    const { id } = await params;
    const course = await api.course.getCourseById({ id });
    return {
      title: `${course.title} - Course`,
      description: course.description ?? `Learn ${course.title}`,
    };
  } catch {
    return {
      title: 'Course Not Found',
    };
  }
}