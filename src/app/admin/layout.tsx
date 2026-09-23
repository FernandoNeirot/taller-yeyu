import { RememberAdminAccess } from "@/features/admin/components/remember-admin-access";
import { getSession } from "@/features/admin/services/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  return (
    <>
      {user ? <RememberAdminAccess /> : null}
      {children}
    </>
  );
}
