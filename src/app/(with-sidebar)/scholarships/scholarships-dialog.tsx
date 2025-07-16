import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Table, TableBody, TableCell, TableRow } from '~/components/ui/table';

type ScholarshipDialogProps = {
  mitra: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  quota: number;
  type: string;
  benefits: string[];
  requirements: string[];
  link: string;
  children?: ReactNode;
};

export default async function ScholarshipDialog({ title, link, children, ...props }: ScholarshipDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Table className='w-full'>
          <TableBody>
            {Object.entries(props).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</TableCell>
                <TableCell>:</TableCell>
                <TableCell className='whitespace-normal'>{Array.isArray(value) ? (
                  <ol className="list-decimal pl-5">
                    {value.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ol>
                ) : value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DialogFooter>
          <Button asChild>
            <Link href={link} target="_blank" rel="noopener noreferrer">
              Apply Now
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const scholarshipsData: ScholarshipDialogProps[] = [
  {
    mitra: "PT Astra International",
    title: "Astra Scholarship 2024",
    description: "Scholarship for outstanding students in engineering and business.",
    deadline: "2024-08-15",
    status: "Open",
    quota: 50,
    type: "Full",
    benefits: [
      "Full tuition coverage",
      "Monthly stipend",
      "Internship opportunity at Astra"
    ],
    requirements: [
      "Minimum GPA 3.5",
      "Active student in 2nd or 3rd year",
      "Recommendation letter from faculty"
    ],
    link: "https://astra-scholarship.com/apply"
  },
  {
    mitra: "Bank Mandiri",
    title: "Mandiri Prestasi Scholarship",
    description: "Supporting students with academic excellence in economics.",
    deadline: "2024-09-01",
    status: "Open",
    quota: 30,
    type: "Partial",
    benefits: [
      "Partial tuition fee",
      "Mentorship program"
    ],
    requirements: [
      "Minimum GPA 3.3",
      "Active in student organizations"
    ],
    link: "https://mandiri-scholarship.com/apply"
  },
  {
    mitra: "Telkom Indonesia",
    title: "Telkom Bright Scholarship",
    description: "For students in IT and telecommunications fields.",
    deadline: "2024-07-20",
    status: "Open",
    quota: 40,
    type: "Full",
    benefits: [
      "Full tuition",
      "Laptop grant",
      "Job placement after graduation"
    ],
    requirements: [
      "Minimum GPA 3.4",
      "Final year student",
      "Portfolio submission"
    ],
    link: "https://telkom-scholarship.com/apply"
  },
  {
    mitra: "Unilever Indonesia",
    title: "Unilever Future Leaders Scholarship",
    description: "Empowering future leaders in business and marketing.",
    deadline: "2024-08-10",
    status: "Open",
    quota: 20,
    type: "Partial",
    benefits: [
      "Partial tuition",
      "Leadership training"
    ],
    requirements: [
      "Minimum GPA 3.2",
      "Essay submission"
    ],
    link: "https://unilever-scholarship.com/apply"
  },
  {
    mitra: "Pertamina Foundation",
    title: "Pertamina Green Scholarship",
    description: "For students passionate about environmental sustainability.",
    deadline: "2024-09-05",
    status: "Open",
    quota: 25,
    type: "Full",
    benefits: [
      "Full tuition",
      "Research grant"
    ],
    requirements: [
      "Minimum GPA 3.5",
      "Research proposal"
    ],
    link: "https://pertamina-scholarship.com/apply"
  },
  {
    mitra: "BCA",
    title: "BCA Finance Scholarship",
    description: "Supporting finance and accounting students.",
    deadline: "2024-08-25",
    status: "Open",
    quota: 35,
    type: "Partial",
    benefits: [
      "Partial tuition",
      "Internship at BCA"
    ],
    requirements: [
      "Minimum GPA 3.3",
      "Active student"
    ],
    link: "https://bca-scholarship.com/apply"
  },
  {
    mitra: "Google Indonesia",
    title: "Google Developer Scholarship",
    description: "For students in computer science and related fields.",
    deadline: "2024-07-30",
    status: "Open",
    quota: 60,
    type: "Full",
    benefits: [
      "Full tuition",
      "Google mentorship",
      "Cloud credits"
    ],
    requirements: [
      "Minimum GPA 3.6",
      "Open source contribution"
    ],
    link: "https://google-scholarship.com/apply"
  },
  {
    mitra: "Microsoft Indonesia",
    title: "Microsoft Imagine Scholarship",
    description: "Encouraging innovation in technology.",
    deadline: "2024-08-18",
    status: "Open",
    quota: 45,
    type: "Full",
    benefits: [
      "Full tuition",
      "Azure credits",
      "Hackathon participation"
    ],
    requirements: [
      "Minimum GPA 3.4",
      "Project proposal"
    ],
    link: "https://microsoft-scholarship.com/apply"
  },
  {
    mitra: "Shopee Indonesia",
    title: "Shopee Tech Scholarship",
    description: "For students in e-commerce and IT.",
    deadline: "2024-09-12",
    status: "Open",
    quota: 30,
    type: "Partial",
    benefits: [
      "Partial tuition",
      "Shopee internship"
    ],
    requirements: [
      "Minimum GPA 3.3",
      "Essay on e-commerce trends"
    ],
    link: "https://shopee-scholarship.com/apply"
  },
  {
    mitra: "Tokopedia",
    title: "Tokopedia Innovation Scholarship",
    description: "For students with innovative project ideas.",
    deadline: "2024-08-22",
    status: "Open",
    quota: 25,
    type: "Full",
    benefits: [
      "Full tuition",
      "Project funding"
    ],
    requirements: [
      "Minimum GPA 3.5",
      "Innovation project proposal"
    ],
    link: "https://tokopedia-scholarship.com/apply"
  },
  {
    mitra: "Danone Indonesia",
    title: "Danone Health Scholarship",
    description: "For students in health and nutrition sciences.",
    deadline: "2024-09-15",
    status: "Open",
    quota: 20,
    type: "Partial",
    benefits: [
      "Partial tuition",
      "Nutrition seminar access"
    ],
    requirements: [
      "Minimum GPA 3.2",
      "Essay on health innovation"
    ],
    link: "https://danone-scholarship.com/apply"
  },
  {
    mitra: "CIMB Niaga",
    title: "CIMB Niaga Scholarship",
    description: "For students in banking and finance.",
    deadline: "2024-08-28",
    status: "Open",
    quota: 30,
    type: "Partial",
    benefits: [
      "Partial tuition",
      "Banking workshop"
    ],
    requirements: [
      "Minimum GPA 3.3",
      "Motivation letter"
    ],
    link: "https://cimb-scholarship.com/apply"
  },
  {
    mitra: "BPJS Kesehatan",
    title: "BPJS Health Scholarship",
    description: "For students in public health and medicine.",
    deadline: "2024-09-10",
    status: "Open",
    quota: 15,
    type: "Full",
    benefits: [
      "Full tuition",
      "BPJS internship"
    ],
    requirements: [
      "Minimum GPA 3.4",
      "Community service experience"
    ],
    link: "https://bpjs-scholarship.com/apply"
  },
  {
    mitra: "Bukalapak",
    title: "Bukalapak Digital Scholarship",
    description: "For students in digital business and IT.",
    deadline: "2024-08-12",
    status: "Open",
    quota: 30,
    type: "Partial",
    benefits: [
      "Partial tuition",
      "Mentorship with Bukalapak team"
    ],
    requirements: [
      "Minimum GPA 3.3",
      "Digital portfolio"
    ],
    link: "https://bukalapak-scholarship.com/apply"
  },
  {
    mitra: "Gojek",
    title: "Gojek NextGen Scholarship",
    description: "For students in transportation and technology.",
    deadline: "2024-09-20",
    status: "Open",
    quota: 40,
    type: "Full",
    benefits: [
      "Full tuition",
      "Gojek internship",
      "Startup bootcamp"
    ],
    requirements: [
      "Minimum GPA 3.5",
      "Startup idea submission"
    ],
    link: "https://gojek-scholarship.com/apply"
  }
];