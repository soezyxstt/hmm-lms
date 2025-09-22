'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import ResourceItem, { type ResourceWithDetails } from '../resourse-item';
import {
  BookOpen, FileText, Video, Award, Clock, ClipboardList, Users, Star, FileQuestion, Presentation, Loader2
} from 'lucide-react';
import { api } from '~/trpc/react';
import { type AppRouter } from '~/server/api/root';
import { type inferRouterOutputs } from '@trpc/server';
import { Badge } from '~/components/ui/badge';
import DocumentViewer from '~/components/document-viewer';

type RouterOutputs = inferRouterOutputs<AppRouter>;
type CourseDataType = RouterOutputs['course']['getCourseById'];

interface CourseContentClientProps {
  initialCourseData: CourseDataType;
  courseId: string;
}

const ResourceCategorySection = ({
  title,
  icon: Icon,
  resources,
  onViewResource
}: {
  title: string;
  icon: React.ElementType;
  resources: ResourceWithDetails[];
  onViewResource: (resource: ResourceWithDetails) => void;
}) => {
  if (!resources || resources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No resources in this category yet.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {resources.map((resource) => (
            <ResourceItem key={resource.id} resource={resource} onViewResource={onViewResource} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function CourseContentClient({ initialCourseData, courseId }: CourseContentClientProps) {
  const [selectedResource, setSelectedResource] = useState<ResourceWithDetails | null>(null);
  const [openViewer, setOpenViewer] = useState(false);

  const { data: materials, isLoading, error } = api.course.getCourseMaterials.useQuery({ id: courseId });

  const course = initialCourseData;

  const handleViewResource = (resource: ResourceWithDetails) => {
    setSelectedResource(resource);
    setOpenViewer(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading course materials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center h-40 p-4 border border-destructive/50 bg-destructive/10 rounded-lg flex flex-col justify-center items-center">
        <p className="font-semibold text-destructive">Failed to load materials</p>
        <p className="text-sm text-destructive/80">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {selectedResource && (
          <DocumentViewer resource={selectedResource} open={openViewer} onOpenChange={setOpenViewer} />
        )}
        <Tabs defaultValue="materials">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="tryouts">Tryouts</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="space-y-6">
            <ResourceCategorySection title="E-books" icon={BookOpen} resources={materials?.E_BOOK ?? []} onViewResource={handleViewResource} />
            <ResourceCategorySection title="Presentations & Slides" icon={Presentation} resources={materials?.PRESENTATION ?? []} onViewResource={handleViewResource} />
            <ResourceCategorySection title="Notes" icon={FileText} resources={materials?.NOTES ?? []} onViewResource={handleViewResource} />
            <ResourceCategorySection title="Syllabus" icon={Star} resources={materials?.SYLLABUS ?? []} onViewResource={handleViewResource} />
            <ResourceCategorySection title="Other Resources" icon={ClipboardList} resources={materials?.OTHER ?? []} onViewResource={handleViewResource} />
          </TabsContent>

          <TabsContent value="problems" className="space-y-6">
            <ResourceCategorySection title="Problems & Past Exams" icon={FileQuestion} resources={materials?.PROBLEMS ?? []} onViewResource={handleViewResource} />
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

          <TabsContent value="videos" className="space-y-6">
            <ResourceCategorySection title="Learning Videos" icon={Video} resources={materials?.VIDEO ?? []} onViewResource={handleViewResource} />
          </TabsContent>
        </Tabs>

        {course.announcements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.announcements.map((announcement) => (
                <div key={announcement.id} className="border-l-4 border-primary pl-4">
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
      </div>
    </>
  );
}