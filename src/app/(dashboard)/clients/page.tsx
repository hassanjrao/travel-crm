import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Mail, Phone, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AddClientDialog } from "@/components/clients/add-client-dialog";
import Link from "next/link";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your customer database</p>
        </div>
        <AddClientDialog>
          <Button>
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </AddClientDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Clients ({clients.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Users className="h-8 w-8 mb-2" />
              <p>No clients yet. Add your first client.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Name", "Contact", "Location", "Passport", "Bookings", "Added", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {client.firstName} {client.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {client.email}
                          </span>
                          {client.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {client.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {client.city || client.country ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {[client.city, client.country].filter(Boolean).join(", ")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{client.passport ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={client._count.bookings > 0 ? "success" : "secondary"}>
                          {client._count.bookings} booking{client._count.bookings !== 1 ? "s" : ""}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(client.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/clients/${client.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
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
