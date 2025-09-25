import CoursesItem from '../courses/course-item';
import { DashboardChart } from './dashboard-chart';
import DashboardCalendar from './date-with-slot';

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
];
const images = ['/images/mesin.png', "/images/pengukuran.png", "/images/pipe_system.png", "/images/printer.png"]

export default function DashboardPage() {
  return (
    <div className="flex mx-auto gap-6 max-sm:flex-col max-w-5xl">
      <div className="space-y-4 md:space-y-6 flex-1">
        <div className="w-full overflow-x-auto gap-4 h-48 md:h-36 grid grid-cols-3">
          {courses.map((course, index) => (
            <CoursesItem
              key={course.id}
              id={course.id}
              href={`/courses/${course.id}`}
              title={course.title}
              image={images[index % images.length] ?? '/images/default_course.png'}
              subject="MS2120"
              numberOfMaterials={course.totalLessons}
              numberOfVideos={course.totalVideos}
              className="aspect-auto md:aspect-auto lg:aspect-auto"
              orientation="horizontal"
            />
          ))}
        </div>

        <div className="h-fit">
          <DashboardChart />
        </div>
      </div>
      <div className="max-w-96">
        <DashboardCalendar />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Dashboard',
}