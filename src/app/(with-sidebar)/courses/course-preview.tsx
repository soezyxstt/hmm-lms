import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import {
  BookOpen,
  FileText,
  Video,
  ClipboardList,
  Users,
  Lock,
  Award
} from 'lucide-react';

interface CoursePreviewProps {
  course: {
    title: string;
    description?: string | null;
    classCode: string;
    _count: {
      members: number;
      tryout: number;
    };
  };
}

export default function CoursePreview({ course }: CoursePreviewProps) {
  const previewItems = [
    {
      title: "E-books & Reading Materials",
      description: "Access comprehensive reading materials and textbooks",
      icon: BookOpen,
      count: "2+ resources",
    },
    {
      title: "Video Lectures",
      description: "Watch recorded lectures and tutorials",
      icon: Video,
      count: "5+ videos",
    },
    {
      title: "Presentations & Slides",
      description: "Download lecture slides and presentations",
      icon: FileText,
      count: "10+ slides",
    },
    {
      title: "Practice Tryouts",
      description: "Test your knowledge with practice exams",
      icon: Award,
      count: `${course._count.tryout} tryouts`,
    },
    {
      title: "Previous Exams",
      description: "Review past exam papers for better preparation",
      icon: ClipboardList,
      count: "Multiple exams",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Course Preview</CardTitle>
          <CardDescription>
            Enroll in this course to access all materials and resources
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What you&apos;ll get access to:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {previewItems.map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg border bg-muted/20">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {item.count}
                  </Badge>
                </div>
                <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold">
              <Users className="h-6 w-6 text-muted-foreground" />
              {course._count.members}
            </div>
            <p className="text-sm text-muted-foreground">Students Enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold">
              <Award className="h-6 w-6 text-muted-foreground" />
              {course._count.tryout}
            </div>
            <p className="text-sm text-muted-foreground">Practice Tryouts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}