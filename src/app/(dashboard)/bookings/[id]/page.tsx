import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { RecordPaymentButton } from "@/components/bookings/record-payment-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

export default async function BookingDetailPage(props: PageProps<"/bookings/[id]">) {
  const { id } = await props.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      client: true,
      tour: { include: { destination: true } },
      agent: { select: { name: true, email: true } },
      payments: { orderBy: { paidAt: "desc" } },
      invoice: true,
    },
  });

  if (!booking) notFound();

  const balance = Number(booking.totalAmount) - Number(booking.paidAmount);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/bookings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Booking {booking.bookingRef}</h2>
          <p className="text-sm text-gray-500">Created {formatDate(booking.createdAt)}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant={STATUS_STYLE[booking.status] ?? "secondary"} className="text-sm px-3 py-1">
            {booking.status}
          </Badge>
          <Badge variant={PAYMENT_STYLE[booking.paymentStatus] ?? "secondary"} className="text-sm px-3 py-1">
            {booking.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Name" value={`${booking.client.firstName} ${booking.client.lastName}`} />
            <Row label="Email" value={booking.client.email} />
            <Row label="Phone" value={booking.client.phone ?? "—"} />
            <Row label="Passport" value={booking.client.passport ?? "—"} />
            <Row label="Country" value={booking.client.country ?? "—"} />
          </CardContent>
        </Card>

        {/* Tour */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tour Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Tour" value={booking.tour.title} />
            <Row label="Destination" value={`${booking.tour.destination.name}, ${booking.tour.destination.country}`} />
            <Row label="Duration" value={`${booking.tour.duration} days`} />
            <Row label="Group Size" value={`${booking.groupSize} people`} />
            <Row label="Travel Date" value={formatDate(booking.travelDate)} />
            {booking.returnDate && <Row label="Return Date" value={formatDate(booking.returnDate)} />}
            <Row label="Agent" value={booking.agent?.name ?? "—"} />
          </CardContent>
        </Card>

        {/* Financials */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Payment Summary</CardTitle>
              {balance > 0 && (
                <RecordPaymentButton bookingId={booking.id} invoiceId={booking.invoice?.id} />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Total Amount" value={formatCurrency(booking.totalAmount.toString())} />
            <Row label="Amount Paid" value={formatCurrency(booking.paidAmount.toString())} highlight="green" />
            <Row
              label="Balance Due"
              value={formatCurrency(balance.toString())}
              highlight={balance > 0 ? "red" : undefined}
            />
            {booking.invoice && (
              <Row label="Invoice" value={booking.invoice.invoiceNo ?? "—"} />
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {(booking.specialRequests || booking.notes) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {booking.specialRequests && (
                <div>
                  <p className="font-medium text-gray-700">Special Requests</p>
                  <p className="text-gray-600 mt-1">{booking.specialRequests}</p>
                </div>
              )}
              {booking.notes && (
                <div>
                  <p className="font-medium text-gray-700">Internal Notes</p>
                  <p className="text-gray-600 mt-1">{booking.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment history */}
      {booking.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Date", "Amount", "Method", "Reference"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {booking.payments.map((p: typeof booking.payments[number]) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-gray-500">{formatDate(p.paidAt)}</td>
                    <td className="px-4 py-3 font-medium text-green-600">{formatCurrency(p.amount.toString())}</td>
                    <td className="px-4 py-3 text-gray-600">{p.method}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.reference ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: "green" | "red" }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span
        className={
          highlight === "green"
            ? "font-semibold text-green-600"
            : highlight === "red"
            ? "font-semibold text-red-600"
            : "font-medium text-gray-900"
        }
      >
        {value}
      </span>
    </div>
  );
}
