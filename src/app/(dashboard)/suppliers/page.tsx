import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Building2, Mail, Phone, Globe } from "lucide-react";
import { AddSupplierDialog } from "@/components/suppliers/add-supplier-dialog";
import { SupplierToggle } from "@/components/suppliers/supplier-toggle";

const TYPE_COLORS: Record<string, "default" | "success" | "info" | "warning" | "secondary"> = {
  HOTEL: "info",
  TRANSPORT: "warning",
  AIRLINE: "default",
  ACTIVITY: "success",
  RESTAURANT: "secondary",
  OTHER: "secondary",
};

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Suppliers</h2>
          <p className="text-sm text-gray-500 mt-1">Manage hotels, transport, airlines and more</p>
        </div>
        <AddSupplierDialog>
          <Button>
            <Plus className="h-4 w-4" />
            Add Supplier
          </Button>
        </AddSupplierDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Suppliers ({suppliers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {suppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Building2 className="h-8 w-8 mb-2" />
              <p>No suppliers yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Name", "Type", "Contact", "Country", "Contact Person", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {suppliers.map((s: typeof suppliers[number]) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant={TYPE_COLORS[s.type] ?? "secondary"}>{s.type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        <div className="flex flex-col gap-0.5">
                          {s.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {s.email}
                            </span>
                          )}
                          {s.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {s.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {s.country ? (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" /> {s.country}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{s.contactPerson ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={s.isActive ? "success" : "secondary"}>
                          {s.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <SupplierToggle supplierId={s.id} isActive={s.isActive} />
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
