"use client";

import { updateBookingStatus } from "@/app/actions/bookings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransition } from "react";

const statuses = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export function BookingStatusUpdate({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={currentStatus}
      onValueChange={(value) => {
        startTransition(() => updateBookingStatus(bookingId, value));
      }}
      disabled={isPending}
    >
      <SelectTrigger className="w-36 h-7 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            {s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
