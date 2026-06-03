import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, CalendarCheck } from "lucide-react";

const STATUS_STYLE: Record<string, "default" | "success" | "warning" | "destructive" | "info" | "secondary"> = {
  PENDING: "warning",
  CONFIRMED: "success",
  IN_PROGRESS: "info",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};

export default async function ClientDetailPage(props: PageProps<"/clients/[id]">) {
  const { id } = await props.params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      bookings: {
        include: { tour: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
      },
      invoices: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!client) notFound();

  const totalSpent = client.bookings.reduce((sum: number, b: typeof client.bookings[number]) => sum + Number(b.paidAmount), 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {client.firstName} {client.lastName}
          </h2>
          <p className="text-sm text-gray-500">Client since {formatDate(client.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              ["Email", client.email],
              ["Phone", client.phone ?? "—"],
              ["Passport", client.passport ?? "—"],
              ["Address", client.address ?? "—"],
              ["City", client.city ?? "—"],
              ["Country", client.country ?? "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center py-2">
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalSpent)}</p>
              <p className="text-sm text-gray-500">Total Spent</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-blue-600">{client.bookings.length}</p>
                <p className="text-xs text-gray-500">Bookings</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-purple-600">{client.invoices.length}</p>
                <p className="text-xs text-gray-500">Invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booking History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {client.bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <CalendarCheck className="h-6 w-6 mb-2" />
              <p className="text-sm">No bookings yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Ref", "Tour", "Travel Date", "Total", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {client.bookings.map((b: typeof client.bookings[number]) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      <Link href={`/bookings/${b.id}`} className="text-blue-600 hover:underline">
                        {b.bookingRef}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{b.tour.title}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(b.travelDate)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(b.totalAmount.toString())}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_STYLE[b.status] ?? "secondary"}>{b.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
