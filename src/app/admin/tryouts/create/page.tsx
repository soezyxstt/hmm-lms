// ~/app/admin/tryouts/create/page.tsx
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { api } from "~/trpc/server";
import TryoutForm from './form';

export default async function CreateTryoutPage() {
  const session = await auth();

  if (!session || session.user.role !== Role.ADMIN) {
    redirect("/");
  }

  const courses = await api.course.getAllCourses();

  return (
    <div className="max-w-5xl relative mx-auto p-6">
      {/* <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Tryout</h1>
        <p className="text-muted-foreground">
          Create a comprehensive tryout with multiple question types
        </p>
      </div> */}
      <TryoutForm courses={courses} />
    </div>
  );
}

export const metadata = {
  title: "Create Tryout - Admin",
};