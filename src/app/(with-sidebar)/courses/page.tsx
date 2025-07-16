// import Link from "next/link";
// import CourseDialog from './dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import CoursesItem from './course-item';

export default async function CoursesPage() {
  const courses = [
    {
      id: '1',
      title: 'Introduction to Mechanical Engineering',
      totalLessons: 12,
      totalVideos: 8,
    },
    {
      id: '2',
      title: 'Measurement Techniques',
      totalLessons: 10,
      totalVideos: 7,
    },
    {
      id: '3',
      title: 'Pipe System Fundamentals',
      totalLessons: 15,
      totalVideos: 10,
    },
    {
      id: '4',
      title: 'Printer Maintenance',
      totalLessons: 8,
      totalVideos: 5,
    },
    {
      id: '5',
      title: 'Advanced CAD Design',
      totalLessons: 14,
      totalVideos: 9,
    },
  ];
  const images = ['/images/mesin.png', "/images/pengukuran.png", "/images/pipe_system.png", "/images/printer.png"]
  // const isAllCourse = searchParams['*'] === 'true';

  return (
    <Tabs defaultValue="tab-1" className="max-w-5xl mx-auto">
      <TabsList className="text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1">
        <TabsTrigger
          value="tab-1"
          className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          My Courses
        </TabsTrigger>
        <TabsTrigger
          value="tab-2"
          className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          All Courses
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab-1">
        <div className='w-full h-full'>
          <div className="flex justify-between flex-col md:flex-row gap-4">
            {/* <Search /> */}
          </div>
          {courses.length === 0 && (
            <p className='text-muted-foreground text-center w-full font-medium py-6'>No courses available</p>
          )}
          <div
            className='grid md:grid-cols-3 lg:grid-cols-4 grid-cols-2 gap-x-4 gap-y-6 md:gap-x-5 lg:gap-x-6 md:gap-y-8 flex-1'>
            {courses.map((course, i: number) => (
              <CoursesItem
                href=''
                key={i}
                id={'ms2120'}
                title={course.title}
                image={images[i % 4]!}
                subject={'MS2021'}
                numberOfMaterials={course.totalLessons}
                numberOfVideos={course.totalVideos}
              />
            ))}
          </div>
        </div>
      </TabsContent>
      <TabsContent value="tab-2">
        <div className='w-full h-full'>
          <div className="flex justify-between flex-col md:flex-row gap-4">
            {/* <Search /> */}
          </div>
          {courses.length === 0 && (
            <p className='text-muted-foreground text-center w-full font-medium py-6'>No courses available</p>
          )}
          <div
            className='grid md:grid-cols-3 lg:grid-cols-4 grid-cols-2 gap-x-4 gap-y-6 md:gap-x-5 lg:gap-x-6 md:gap-y-8 flex-1'>
            {courses.map((course, i: number) => (
              <CoursesItem
                href=''
                key={i}
                id={'ms2120'}
                title={course.title}
                image={images[i % 4]!}
                subject={'MS2021'}
                numberOfMaterials={course.totalLessons}
                numberOfVideos={course.totalVideos}
              />
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export const metadata = {
  title: 'Courses',
};
