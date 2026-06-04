import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, UserCheck, Mail, Phone } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AddAgentDialog } from "@/components/agents/add-agent-dialog";
import { AgentToggle } from "@/components/agents/agent-toggle";

export default async function AgentsPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/");
  }

  const agents = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true, leads: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agents</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your sales team (Admin only)</p>
        </div>
        <AddAgentDialog>
          <Button>
            <Plus className="h-4 w-4" />
            Add Agent
          </Button>
        </AddAgentDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Users ({agents.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <UserCheck className="h-8 w-8 mb-2" />
              <p>No agents found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Name", "Contact", "Role", "Leads", "Bookings", "Status", "Joined", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {agents.map((agent: typeof agents[number]) => (
                    <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{agent.name}</td>
                      <td className="px-4 py-3 text-gray-500">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {agent.email}
                          </span>
                          {agent.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {agent.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={agent.role === "ADMIN" ? "default" : "secondary"}>
                          {agent.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{agent._count.leads}</td>
                      <td className="px-4 py-3 text-gray-600">{agent._count.bookings}</td>
                      <td className="px-4 py-3">
                        <Badge variant={agent.isActive ? "success" : "destructive"}>
                          {agent.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(agent.createdAt)}</td>
                      <td className="px-4 py-3">
                        <AgentToggle agentId={agent.id} isActive={agent.isActive} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
