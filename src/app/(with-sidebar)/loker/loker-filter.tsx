// ~/components/job-vacancy/job-vacancy-filters.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { X } from 'lucide-react';

export const AVAILABLE_STREAMS = [
  "Design & Manufacturing",
  "Automotive Engineering",
  "Aerospace Engineering",
  "Energy & Power Systems",
  "HVAC & Refrigeration",
  "Materials Engineering",
  "Robotics & Automation",
  "Maintenance Engineering",
  "Quality Control & Assurance",
  "Project Management",
  "Research & Development",
  "Production Engineering",
  "Thermal Engineering",
  "Fluid Mechanics",
  "Machine Design",
  "Industrial Engineering",
  "Oil & Gas Engineering",
  "Marine Engineering",
  "Biomedical Engineering",
  "Environmental Engineering",
];

export function JobVacancyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedStreams, setSelectedStreams] = useState<string[]>(
    searchParams.getAll("streams")
  );

  const handleClearFilters = () => {
    setSelectedStreams([]);
    router.push("/loker");
  };

  const handleStreamChange = (stream: string, checked: boolean) => {
    if (checked) {
      setSelectedStreams([...selectedStreams, stream]);
    } else {
      setSelectedStreams(selectedStreams.filter((s) => s !== stream));
    }
  };

  const hasActiveFilters = selectedStreams.length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Streams/Tracks</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {AVAILABLE_STREAMS.map((stream) => (
            <div key={stream} className="flex items-center space-x-2">
              <Checkbox
                id={stream}
                checked={selectedStreams.includes(stream)}
                onCheckedChange={(checked) =>
                  handleStreamChange(stream, checked as boolean)
                }
              />
              <Label
                htmlFor={stream}
                className="text-sm font-normal cursor-pointer"
              >
                {stream}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearFilters}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}