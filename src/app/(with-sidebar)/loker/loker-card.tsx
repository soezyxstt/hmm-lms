// ~/components/job-vacancy/job-vacancy-card.tsx
import Link from "next/link";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Building2, MapPin, Clock, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobVacancy {
  id: string;
  title: string;
  company: string;
  position: string;
  eligibility: string;
  streams: string[];
  overview: string;
  createdAt: Date;
  createdBy: {
    name: string;
  };
}

interface JobVacancyCardProps {
  jobVacancy: JobVacancy;
}

export function JobVacancyCard({ jobVacancy }: JobVacancyCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Link
                href={`/loker/${jobVacancy.id}`}
                className="hover:underline"
              >
                <h3 className="text-xl font-semibold">{jobVacancy.title}</h3>
              </Link>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
            <Link href={`/loker/${jobVacancy.id}`}>
              <Button variant="outline" size="sm">
                View Details
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {jobVacancy.streams.slice(0, 3).map((stream) => (
              <Badge key={stream} variant="secondary">
                {stream}
              </Badge>
            ))}
            {jobVacancy.streams.length > 3 && (
              <Badge variant="outline">
                +{jobVacancy.streams.length - 3} more
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            <span className="font-medium">Eligibility:</span> {jobVacancy.eligibility}
          </p>

          <p className="text-sm line-clamp-3">{jobVacancy.overview}</p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Posted {formatDistanceToNow(jobVacancy.createdAt)} ago
            </div>
            <span>By {jobVacancy.createdBy.name}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}