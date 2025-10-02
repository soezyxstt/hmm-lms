import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { FormSubmitClient } from '../forms-submit-client';

interface FormSubmitPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FormSubmitPage({ params }: FormSubmitPageProps) {
  const { id } = await params;
  const form = await api.form.getById({ id });

  return (
    <div className="container mx-auto max-w-5xl">
      <FormSubmitClient form={form} />
    </div>
  );
}