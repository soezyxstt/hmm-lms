import { api } from '~/trpc/server';
import { Badge } from '~/components/ui/badge';
import {
  ClipboardList,
  Users,
  CheckCircle,
  Crown,
} from 'lucide-react';
import EnrollButton from '../enroll-button';
import CoursePreview from '../course-preview';
import UnenrollButton from './unenroll-button';
import { notFound } from 'next/navigation';
import { TRPCError } from '@trpc/server';
import CourseContentClient from './client'; // Correct import path

interface CoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DetailedCoursePage({ params }: CoursePageProps) {
  try {
    const { id } = await params;
    const course = await api.course.getCourseById({ id });

    // This guard clause is essential to prevent runtime errors for invalid IDs
    if (!course) {
      notFound();
    }

    const canAccessContent = course.isEnrolled || course.isAdmin;

    if (!canAccessContent) {
      return (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-secondary rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground">
                  {course.title}
                </h1>
                <p className="text-muted-foreground mt-2">
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
          <CoursePreview course={course} />
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {course.isAdmin ? (
                  <>
                    <Crown className="h-5 w-5 text-primary" />
                    <Badge variant="default">Admin Access</Badge>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-success" />
                    <Badge variant="default" className="bg-success hover:bg-success/90">Enrolled</Badge>
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground">{course.title}</h1>
              <p className="text-muted-foreground mt-2">{course.description ?? 'No description available'}</p>
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="secondary" className="flex items-center gap-1"><Users className="h-3 w-3" />{course._count.members} students</Badge>
                <Badge variant="outline" className="flex items-center gap-1"><ClipboardList className="h-3 w-3" />{course._count.tryout} tryouts</Badge>
                <Badge variant="outline">{course.classCode}</Badge>
              </div>
            </div>
            <div className="flex-shrink-0">
              {course.isEnrolled && !course.isAdmin && (
                <UnenrollButton courseId={course.id} courseName={course.title} />
              )}
            </div>
          </div>
        </div>

        {/* FIX: Passing the correct prop names: `initialCourseData` and `courseId` */}
        <CourseContentClient initialCourseData={course} courseId={id} />
      </div>
    );
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
      notFound();
    }
    console.error(error);
    return <div>An unexpected error occurred. Please try again later.</div>
  }
}

export async function generateMetadata({ params }: CoursePageProps) {
  try {
    const { id } = await params;
    const course = await api.course.getCourseById({ id });

    if (!course) {
      return {
        title: 'Course Not Found',
      };
    }

    return {
      title: `${course.title} - Course`,
      description: course.description ?? `Learn about ${course.title}`,
    };
  } catch {
    return {
      title: 'Course Not Found',
    };
  }
}