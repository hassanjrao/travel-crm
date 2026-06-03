import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default async function DashboardLayout(props: LayoutProps<"/">) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          title="TravelCRM"
          userName={session.user?.name ?? "User"}
          userRole={(session.user as { role?: string }).role ?? "AGENT"}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {props.children}
        </main>
      </div>
    </div>
  );
}
