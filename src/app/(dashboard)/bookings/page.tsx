import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, CalendarCheck } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { AddBookingDialog } from "@/components/bookings/add-booking-dialog";
import { BookingStatusUpdate } from "@/components/bookings/booking-status-update";
import Link from "next/link";

const STATUS_STYLE: Record<string, "default" | "success" | "warning" | "destructive" | "info" | "secondary"> = {
  PENDING: "warning",
  CONFIRMED: "success",
  IN_PROGRESS: "info",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};

const PAYMENT_STYLE: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  UNPAID: "destructive",
  PARTIAL: "warning",
  PAID: "success",
  REFUNDED: "secondary",
};

export default async function BookingsPage() {
  const [bookings, clients, tours] = await Promise.all([
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { firstName: true, lastName: true } },
        tour: { select: { title: true } },
        agent: { select: { name: true } },
      },
    }),
    prisma.client.findMany({ select: { id: true, firstName: true, lastName: true } }),
    prisma.tour.findMany({ select: { id: true, title: true, pricePerPerson: true }, where: { isActive: true } }),
  ]);

  const serializedTours = tours.map((t: typeof tours[number]) => ({ ...t, pricePerPerson: t.pricePerPerson.toString() }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">Track all tour bookings</p>
        </div>
        <AddBookingDialog clients={clients} tours={serializedTours}>
          <Button>
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
        </AddBookingDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Bookings ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <CalendarCheck className="h-8 w-8 mb-2" />
              <p>No bookings yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Ref", "Client", "Tour", "Travel Date", "Group", "Total", "Paid", "Payment", "Status", "Agent", "Actions"].map(
                      (h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{b.bookingRef}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {b.client.firstName} {b.client.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{b.tour.title}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(b.travelDate)}</td>
                      <td className="px-4 py-3 text-gray-500 text-center">{b.groupSize}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(b.totalAmount.toString())}</td>
                      <td className="px-4 py-3 text-green-600">{formatCurrency(b.paidAmount.toString())}</td>
                      <td className="px-4 py-3">
                        <Badge variant={PAYMENT_STYLE[b.paymentStatus] ?? "secondary"}>
                          {b.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <BookingStatusUpdate bookingId={b.id} currentStatus={b.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">{b.agent?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Link href={`/bookings/${b.id}`}>
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
