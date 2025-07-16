import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';

type AnnouncementItemProps = {
  user: {
    name: string;
    position: string;
    image?: string;
  };
  title: string;
  content: string;
  date: string;
  priority: number;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const dummyAnnouncements: AnnouncementItemProps[] = [
  {
    user: {
      name: "Alice Johnson",
      position: "Instructor",
      image: "/avatars/alice.png",
    },
    title: "Course Update",
    content:
      "The syllabus for next week has been updated. Please check the course page for details. This update includes additional reading materials, revised deadlines for assignments, and new topics that will be covered in the upcoming lectures. Make sure to review all changes and reach out if you have any questions regarding the new schedule or requirements.",
    date: formatDate("2024-06-10"),
    priority: 0.9,
  },
  {
    user: {
      name: "Bob Smith",
      position: "Teaching Assistant",
      image: "/avatars/bob.png",
    },
    title: "Assignment Reminder",
    content:
      "Don't forget to submit Assignment 2 by Friday midnight. Late submissions will not be accepted unless you have prior approval. Please ensure your work is original and follows the guidelines provided in the assignment brief. If you encounter any issues, contact the teaching staff before the deadline.",
    date: formatDate("2024-06-08"),
    priority: 0.7,
  },
  {
    user: {
      name: "Carol Lee",
      position: "Admin",
      image: "/avatars/carol.png",
    },
    title: "Maintenance Notice",
    content:
      "The platform will be down for maintenance on Saturday from 2AM to 4AM. During this time, you will not be able to access course materials, submit assignments, or participate in discussions. We apologize for any inconvenience and appreciate your understanding as we work to improve system performance and security.",
    date: formatDate("2024-06-07"),
    priority: 0.6,
  },
  {
    user: {
      name: "David Kim",
      position: "Instructor",
      image: "/avatars/david.png",
    },
    title: "Exam Schedule Announcement",
    content:
      "The final exam will be held on June 20th at 10AM in Room 204. Please arrive at least 15 minutes early and bring your student ID. The exam will cover all topics discussed throughout the semester, including recent updates to the syllabus. Review the study guide and reach out if you have any questions.",
    date: formatDate("2024-06-05"),
    priority: 0.85,
  },
  {
    user: {
      name: "Emily Chen",
      position: "Teaching Assistant",
      image: "/avatars/emily.png",
    },
    title: "Group Project Feedback",
    content:
      "Feedback for the group projects has been posted on the course portal. Please review your team's comments and suggested improvements. If you have questions about your grade or feedback, schedule a meeting with your TA during office hours.",
    date: formatDate("2024-06-03"),
    priority: 0.5,
  },
];

export default function AnnouncementItem({ user, title, content, date, priority }: AnnouncementItemProps) {
  return (
    <div className="space-y-4 p-4 rounded-lg shadow-sm bg-card border">
      <div className="">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage
              src={user?.image ?? '/default-avatar.png'}
              alt='avatar'
            />
            <AvatarFallback className='bg-white'>
              {user?.name?.split(' ').map((t: string) => t[0])}
            </AvatarFallback>
          </Avatar>
          <div className='*:text-[0.625rem]'>
            <p className='font-semibold'>{user.name}</p>
            <p className='text-abu-3'>{user?.position} - {date}</p>
          </div>
        </div>
        <Separator className="my-2" />
      </div>
      <div className="flex gap-2 items-center">
        <h2 className="font-semibold">{title}</h2>
        {priority > 0.8 && <Badge variant='destructive' className=''>Important</Badge>}
      </div>
      <p className="text-sm text-muted-foreground">{content}</p>
    </div>
  );
}