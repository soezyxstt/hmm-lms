// ~/components/job-vacancy/job-vacancy-list.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import { JobVacancyCard } from './loker-card';
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Loader2, AlertCircle, Briefcase } from "lucide-react";

export function JobVacancyList() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? undefined;
  const streams = searchParams.getAll("streams");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = api.loker.getAll.useInfiniteQuery(
    {
      limit: 10,
      search,
      streams: streams.length > 0 ? streams : undefined,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load job vacancies. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const jobVacancies = data?.pages.flatMap((page) => page.jobVacancies) ?? [];

  if (jobVacancies.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No job vacancies found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobVacancies.map((jobVacancy) => (
        <JobVacancyCard key={jobVacancy.id} jobVacancy={jobVacancy} />
      ))}

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}