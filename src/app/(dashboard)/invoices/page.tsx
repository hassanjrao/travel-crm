import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { AddInvoiceDialog } from "@/components/finance/add-invoice-dialog";
import { InvoiceStatusUpdate } from "@/components/finance/invoice-status-update";

const STATUS_STYLE: Record<string, "default" | "success" | "warning" | "destructive" | "info" | "secondary"> = {
  DRAFT: "secondary",
  SENT: "info",
  PAID: "success",
  OVERDUE: "destructive",
  CANCELLED: "secondary",
};

export default async function InvoicesPage() {
  const [invoices, bookingsWithoutInvoice] = await Promise.all([
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { firstName: true, lastName: true } },
        booking: { select: { bookingRef: true } },
      },
    }),
    prisma.booking.findMany({
      where: { invoice: null, status: { not: "CANCELLED" } },
      select: { id: true, bookingRef: true, client: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i: typeof invoices[number]) => i.status === "PAID").length,
    outstanding: invoices.filter((i: typeof invoices[number]) => i.status === "SENT").length,
    overdue: invoices.filter((i: typeof invoices[number]) => i.status === "OVERDUE").length,
    totalAmount: invoices.reduce((sum: number, i: typeof invoices[number]) => sum + Number(i.totalAmount), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
          <p className="text-sm text-gray-500 mt-1">Generate and track client invoices</p>
        </div>
        <AddInvoiceDialog bookings={bookingsWithoutInvoice}>
          <Button>
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </AddInvoiceDialog>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Invoices", value: stats.total, color: "text-blue-600" },
          { label: "Paid", value: stats.paid, color: "text-green-600" },
          { label: "Outstanding", value: stats.outstanding, color: "text-yellow-600" },
          { label: "Overdue", value: stats.overdue, color: "text-red-600" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FileText className="h-8 w-8 mb-2" />
              <p>No invoices yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Invoice #", "Client", "Booking", "Issue Date", "Due Date", "Amount", "Tax", "Total", "Status", "Actions"].map(
                      (h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((inv: typeof invoices[number]) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-blue-600">{inv.invoiceNo}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {inv.client.firstName} {inv.client.lastName}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{inv.booking.bookingRef}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(inv.issueDate)}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(inv.dueDate)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatCurrency(inv.subtotal.toString())}</td>
                      <td className="px-4 py-3 text-gray-500">{Number(inv.taxRate).toFixed(0)}%</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(inv.totalAmount.toString())}</td>
                      <td className="px-4 py-3">
                        <InvoiceStatusUpdate invoiceId={inv.id} currentStatus={inv.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_STYLE[inv.status] ?? "secondary"}>{inv.status}</Badge>
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
