import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import UserManagement from "./user-management";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session || session.user.role !== Role.ADMIN) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">
          View and manage all users in the system
        </p>
      </div>
      <UserManagement />
    </div>
  );
}

export const metadata = {
  title: "Manage Users",
};