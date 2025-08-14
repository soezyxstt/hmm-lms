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

export default function ScholarshipDialog({ title, link, children, ...props }: ScholarshipDialogProps) {
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