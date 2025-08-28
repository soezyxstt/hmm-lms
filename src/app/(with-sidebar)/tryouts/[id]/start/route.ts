// ~/app/(student)/tryouts/[id]/start/route.ts
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  try {
    const attempt = await api.tryout.startAttempt({ id });
    redirect(`/tryouts/${id}/attempt/${attempt.id}`);
  } catch (error) {
    console.error("Failed to start attempt:", error);
    redirect(`/tryouts/${id}?error=failed-to-start`);
  }
}
