// ~/components/job-vacancy/job-vacancy-detail.tsx
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Building2,
  MapPin,
  Users,
  Calendar,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobVacancy {
  id: string;
  title: string;
  company: string;
  position: string;
  eligibility: string;
  streams: string[];
  overview: string;
  timeline: string;
  applyLink: string;
  createdAt: Date;
  createdBy: {
    name: string;
  };
}

interface JobVacancyDetailProps {
  jobVacancy: JobVacancy;
}

export function JobVacancyDetail({ jobVacancy }: JobVacancyDetailProps) {
  return (
    <div className="container mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/loker">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div>
                  <CardTitle className="text-2xl">{jobVacancy.title}</CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {jobVacancy.company}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {jobVacancy.position}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {jobVacancy.streams.map((stream) => (
                    <Badge key={stream} variant="secondary">
                      {stream}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Eligibility
                </h3>
                <p className="text-sm">{jobVacancy.eligibility}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Overview</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{jobVacancy.overview}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{jobVacancy.timeline}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Apply Now</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ready to take the next step in your career?
              </p>
              <Button asChild className="w-full">
                <a
                  href={jobVacancy.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply Now
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company:</span>
                  <span className="font-medium">{jobVacancy.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position:</span>
                  <span className="font-medium">{jobVacancy.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted:</span>
                  <span className="font-medium">
                    {formatDistanceToNow(jobVacancy.createdAt)} ago
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted by:</span>
                  <span className="font-medium">{jobVacancy.createdBy.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}