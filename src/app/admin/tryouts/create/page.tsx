
import { api } from "~/trpc/server";
import TryoutForm from './form';

export default async function CreateTryoutPage() {

  const courses = await api.course.getAllCourses();

  return (
    <div className="max-w-5xl relative mx-auto">
      <TryoutForm courses={courses} />
    </div>
  );
}

export const metadata = {
  title: "Create Tryout - Admin",
};