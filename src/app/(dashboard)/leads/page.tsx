import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Mail, Phone, User } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { AddLeadDialog } from "@/components/leads/add-lead-dialog";
import { LeadStatusUpdate } from "@/components/leads/lead-status-update";

const STATUS_STYLE: Record<string, "default" | "success" | "warning" | "destructive" | "info" | "secondary"> = {
  NEW: "info",
  CONTACTED: "secondary",
  QUALIFIED: "warning",
  PROPOSAL: "default",
  NEGOTIATION: "warning",
  CONVERTED: "success",
  LOST: "destructive",
};

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { assignedTo: { select: { name: true } } },
  });

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "NEW").length,
    converted: leads.filter((l) => l.status === "CONVERTED").length,
    lost: leads.filter((l) => l.status === "LOST").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and track potential customers</p>
        </div>
        <AddLeadDialog>
          <Button>
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </AddLeadDialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: stats.total, color: "text-blue-600" },
          { label: "New", value: stats.new, color: "text-purple-600" },
          { label: "Converted", value: stats.converted, color: "text-green-600" },
          { label: "Lost", value: stats.lost, color: "text-red-600" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Leads ({leads.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <User className="h-8 w-8 mb-2" />
              <p>No leads yet. Add your first lead.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Name", "Contact", "Destination", "Budget", "Source", "Status", "Assigned", "Created", "Actions"].map(
                      (h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead: typeof leads[number]) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {lead.firstName} {lead.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {lead.email}
                          </span>
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {lead.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{lead.destination ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {lead.budget ? formatCurrency(lead.budget.toString()) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{lead.source ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_STYLE[lead.status] ?? "secondary"}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{lead.assignedTo?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(lead.createdAt)}</td>
                      <td className="px-4 py-3">
                        <LeadStatusUpdate leadId={lead.id} currentStatus={lead.status} />
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
