import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import ScholarshipDialog, { scholarshipsData } from './scholarships-dialog';

export default async function ScholarshipPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Tabs defaultValue="tab-1" className="">
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
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Mitra</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scholarshipsData.map((scholarship, index) => (
                <ScholarshipDialog key={scholarship.title} {...scholarship}>
                  <TableRow className='odd:bg-accent/50 cursor-pointer'>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{scholarship.mitra}</TableCell>
                    <TableCell>{scholarship.title}</TableCell>
                    <TableCell>{scholarship.deadline}</TableCell>
                    <TableCell>{scholarship.status}</TableCell>
                  </TableRow>
                </ScholarshipDialog>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="tab-2">

        </TabsContent>
      </Tabs>
    </div>
  )
}