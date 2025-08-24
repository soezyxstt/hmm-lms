// ~/app/admin/layout.tsx
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import AdminNavbar from '~/components/admin/navbar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect non-admin users
  if (!session || session.user.role !== Role.ADMIN) {
    redirect("/");
  }

  return <AdminNavbar>{children}</AdminNavbar>;
}

export const metadata = {
  title: {
    template: "%s - Admin Panel",
    default: "Admin Panel",
  },
  description: "Admin panel for HMM ITB",
};