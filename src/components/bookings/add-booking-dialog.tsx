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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBooking } from "@/app/actions/bookings";

interface Props {
  children: React.ReactNode;
  clients: { id: string; firstName: string; lastName: string }[];
  tours: { id: string; title: string; pricePerPerson: string }[];
}

export function AddBookingDialog({ children, clients, tours }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [clientId, setClientId] = useState("");
  const [tourId, setTourId] = useState("");

  function handleSubmit(formData: FormData) {
    formData.set("clientId", clientId);
    formData.set("tourId", tourId);
    startTransition(async () => {
      const result = await createBooking(formData);
      if (result?.success) setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Booking</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Client *</Label>
            <Select onValueChange={setClientId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select client..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Tour *</Label>
            <Select onValueChange={setTourId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select tour..." />
              </SelectTrigger>
              <SelectContent>
                {tours.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="travelDate">Travel Date *</Label>
              <Input id="travelDate" name="travelDate" type="date" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="returnDate">Return Date</Label>
              <Input id="returnDate" name="returnDate" type="date" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="groupSize">Group Size</Label>
              <Input id="groupSize" name="groupSize" type="number" defaultValue="1" min="1" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="totalAmount">Total Amount (USD) *</Label>
              <Input id="totalAmount" name="totalAmount" type="number" step="0.01" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea id="specialRequests" name="specialRequests" rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !clientId || !tourId}>
              {isPending ? "Creating..." : "Create Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
