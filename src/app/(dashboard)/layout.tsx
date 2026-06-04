import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LayoutShell } from "@/components/layout-shell";

export default async function DashboardLayout(props: LayoutProps<"/">) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <LayoutShell
      userName={session.user?.name ?? "User"}
      userRole={(session.user as { role?: string }).role ?? "AGENT"}
    >
      {props.children}
    </LayoutShell>
  );
}
