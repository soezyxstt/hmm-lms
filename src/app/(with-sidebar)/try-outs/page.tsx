import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

const tryouts = [
  {
    id: 1,
    course: "Mathematics",
    title: "Algebra Basics",
    totalQuestions: 20,
    score: 80,
  },
  {
    id: 2,
    course: "Physics",
    title: "Newton's Laws",
    totalQuestions: 15,
    score: 65,
  },
  {
    id: 3,
    course: "Chemistry",
    title: "Periodic Table",
    totalQuestions: 18,
    score: 40,
  },
  {
    id: 4,
    course: "Biology",
    title: "Cell Structure",
    totalQuestions: 22,
    score: 100,
  },
  {
    id: 5,
    course: "English",
    title: "Grammar Essentials",
    totalQuestions: 25,
    score: undefined,
  },
];

export default async function TryOutsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>
              No.
            </TableHead>
            <TableHead>
              Course
            </TableHead>
            <TableHead>
              Title
            </TableHead>
            <TableHead>
              Total Questions
            </TableHead>
            <TableHead>
              Score
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tryouts.map((tryout, idx) => {
            let scoreDisplay = "-";
            let scoreClass = "";
            if (typeof tryout.score === "number") {
              scoreDisplay = tryout.score.toString();
              if (tryout.score < 50) scoreClass = "text-destructive";
              else if (tryout.score < 75) scoreClass = "text-warn";
              else scoreClass = "text-success";
            }
            return (
              <TableRow className='odd:bg-accent/50' key={tryout.id}>
                <TableCell>
                  {/* This cell contains the link that will cover the whole row */}
                  <Link href={`/try-outs/${tryout.id}`} className="absolute inset-0">
                    <span className="sr-only">View details for {tryout.title}</span>
                  </Link>
                  {/* The content below is still visible */}
                  {idx + 1}
                </TableCell>
                {/* <TableCell>{idx + 1}</TableCell> */}
                <TableCell>{tryout.course}</TableCell>
                <TableCell>{tryout.title}</TableCell>
                <TableCell>{tryout.totalQuestions}</TableCell>
                <TableCell className={scoreClass}>{scoreDisplay}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  )
}