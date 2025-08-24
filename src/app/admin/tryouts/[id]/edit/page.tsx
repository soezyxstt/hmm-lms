// ~/app/admin/tryouts/[id]/edit/page.tsx
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { api } from "~/trpc/server";
import TryoutForm from '../../create/form';
import type { TryoutFormData } from '../../create/form';

interface EditTryoutPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTryoutPage({ params }: EditTryoutPageProps) {
  const session = await auth();

  if (!session || session.user.role !== Role.ADMIN) {
    redirect("/");
  }

  const { id } = await params;
  const [tryout, courses] = await Promise.all([
    api.tryout.getForEdit({ id }),
    api.course.getAllCourses(),
  ]);

  const initialData: TryoutFormData = {
    id: tryout.id,
    title: tryout.title,
    description: tryout.description,
    duration: tryout.duration,
    courseId: tryout.courseId,
    isActive: tryout.isActive,
    questions: tryout.questions.map(q => ({
      id: q.id,
      type: q.type,
      question: q.question,
      points: q.points,
      required: q.required,
      options: q.options?.map(opt => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.isCorrect,
        explanation: opt.explanation,
      })),
    })),
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Tryout</h1>
        <p className="text-muted-foreground">
          Modify the tryout details and questions
        </p>
      </div>
      <TryoutForm
        courses={courses}
        initialData={initialData}
        isEdit={true}
      />
    </div>
  );
}

export const metadata = {
  title: "Edit Tryout",
};