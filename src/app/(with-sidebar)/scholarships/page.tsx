"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import ScholarshipDialog from './scholarships-dialog';
import { api } from '~/trpc/react';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '~/components/ui/skeleton';
import { Suspense } from 'react';

function ScholarshipTableSkeleton() {
  return (
    <div>
      {/* Skeleton for Tabs */}
      <div className="h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1 flex mb-4">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Skeleton for Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-5 w-8" /></TableHead>
            <TableHead><Skeleton className="h-5 w-[150px]" /></TableHead>
            <TableHead><Skeleton className="h-5 w-[250px]" /></TableHead>
            <TableHead><Skeleton className="h-5 w-[100px]" /></TableHead>
            <TableHead><Skeleton className="h-5 w-[80px]" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index} className='odd:bg-accent/50'>
              <TableCell><Skeleton className="h-4 w-6" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[140px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[230px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[90px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[70px]" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ScholarshipTable() {
  const [allData] = api.scholarship.getAll.useSuspenseQuery();
  const params = useSearchParams();
  const id = params.get("id");

  const dataToDisplay = id ? allData.filter(item => item.id === id) : allData;
  const now = new Date();

  const availableScholarships = dataToDisplay.filter(s => s.deadline >= now);
  const pastDueScholarships = dataToDisplay.filter(s => s.deadline < now);

  const renderTableBody = (scholarships: typeof dataToDisplay) => (
    <TableBody>
      {scholarships.map((scholarship, index) => (
        <ScholarshipDialog key={scholarship.id} mitra={scholarship.provider} title={scholarship.title} deadline={scholarship.deadline.toLocaleDateString()} status={scholarship.provider} type='External' description={scholarship.description} benefits={["dsadadada", "dadasdasda ashj dagd sa dja daj aj", "jhsvd av hagd ioq j dsh ffuo fs gy fghfd sdj"]} requirements={["bsgds ha jda", "jkhashsd a ddjgagdaj ad gjagja a", "hjda a sdhafi i aiu ajsgajda ddjad", "dhjag ddg ahdajd gjagd adks djha jda gda jsdaasjk af"]} link={scholarship.link} quota={221} >
          <TableRow className='odd:bg-accent/50 cursor-pointer'>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{scholarship.provider}</TableCell>
            <TableCell>{scholarship.title}</TableCell>
            <TableCell>{scholarship.deadline.toLocaleDateString()}</TableCell>
            <TableCell>{scholarship.provider}</TableCell>
          </TableRow>
        </ScholarshipDialog>
      ))}
    </TableBody>
  );

  return (
    <Tabs defaultValue="tab-1">
      {/* Restored Original Styling */}
      <TabsList className="text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1">
        <TabsTrigger
          value="tab-1"
          className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          Available
        </TabsTrigger>
        <TabsTrigger
          value="tab-2"
          className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          Past Due
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Mitra</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          {renderTableBody(availableScholarships)}
        </Table>
      </TabsContent>
      <TabsContent value="tab-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Mitra</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          {renderTableBody(pastDueScholarships)}
        </Table>
      </TabsContent>
    </Tabs>
  );
}

export default function ScholarshipPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Suspense fallback={<ScholarshipTableSkeleton />}>
        <ScholarshipTable />
      </Suspense>
    </div>
  )
}