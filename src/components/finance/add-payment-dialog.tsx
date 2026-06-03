"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addPayment } from "@/app/actions/finance";
import { formatCurrency } from "@/lib/utils";

interface Booking {
  id: string;
  bookingRef: string;
  totalAmount: string;
  paidAmount: string;
  client: { firstName: string; lastName: string };
  invoice: { id: string } | null;
}

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Credit Card", "PayPal", "Stripe", "Check"];

export function AddPaymentDialog({ children, bookings }: { children: React.ReactNode; bookings: Booking[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [bookingId, setBookingId] = useState("");
  const [method, setMethod] = useState("");

  const selectedBooking = bookings.find((b) => b.id === bookingId);

  function handleSubmit(formData: FormData) {
    formData.set("bookingId", bookingId);
    formData.set("method", method);
    if (selectedBooking?.invoice?.id) {
      formData.set("invoiceId", selectedBooking.invoice.id);
    }
    startTransition(async () => {
      const result = await addPayment(formData);
      if (result?.success) setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Booking *</Label>
            <Select onValueChange={setBookingId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select booking..." />
              </SelectTrigger>
              <SelectContent>
                {bookings.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.bookingRef} — {b.client.firstName} {b.client.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBooking && (
            <div className="rounded-lg bg-blue-50 p-3 text-sm">
              <p className="text-blue-800">
                <span className="font-medium">Total:</span> {formatCurrency(String(selectedBooking.totalAmount))} |{" "}
                <span className="font-medium">Paid:</span> {formatCurrency(String(selectedBooking.paidAmount))} |{" "}
                <span className="font-medium text-red-600">
                  Balance:{" "}
                  {formatCurrency(String(Number(selectedBooking.totalAmount) - Number(selectedBooking.paidAmount)))}
                </span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (USD) *</Label>
              <Input id="amount" name="amount" type="number" step="0.01" required />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Method *</Label>
              <Select onValueChange={setMethod} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reference">Reference / Transaction ID</Label>
            <Input id="reference" name="reference" placeholder="Optional" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !bookingId || !method}>
              {isPending ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
