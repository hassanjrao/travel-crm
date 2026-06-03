import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { AddPaymentDialog } from "@/components/finance/add-payment-dialog";

export default async function PaymentsPage() {
  const [payments, bookings] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { paidAt: "desc" },
      include: {
        booking: {
          include: {
            client: { select: { firstName: true, lastName: true } },
          },
        },
        invoice: { select: { invoiceNo: true } },
      },
    }),
    prisma.booking.findMany({
      where: { paymentStatus: { not: "PAID" }, status: { not: "CANCELLED" } },
      select: {
        id: true,
        bookingRef: true,
        totalAmount: true,
        paidAmount: true,
        client: { select: { firstName: true, lastName: true } },
        invoice: { select: { id: true } },
      },
    }),
  ]);

  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const serializedBookings = bookings.map((b: typeof bookings[number]) => ({
    ...b,
    totalAmount: b.totalAmount.toString(),
    paidAmount: b.paidAmount.toString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
          <p className="text-sm text-gray-500 mt-1">Track all payment transactions</p>
        </div>
        <AddPaymentDialog bookings={serializedBookings}>
          <Button>
            <Plus className="h-4 w-4" />
            Record Payment
          </Button>
        </AddPaymentDialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCollected)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-gray-500">Transactions</p>
            <p className="text-2xl font-bold text-blue-600">{payments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-gray-500">Pending Bookings</p>
            <p className="text-2xl font-bold text-yellow-600">{bookings.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <CreditCard className="h-8 w-8 mb-2" />
              <p>No payments recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Date", "Client", "Booking", "Invoice", "Amount", "Method", "Reference"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment: typeof payments[number]) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500">{formatDate(payment.paidAt)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {payment.booking.client.firstName} {payment.booking.client.lastName}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{payment.booking.bookingRef}</td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">
                        {payment.invoice?.invoiceNo ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-600">
                        {formatCurrency(payment.amount.toString())}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{payment.method}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                        {payment.reference ?? "—"}
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
