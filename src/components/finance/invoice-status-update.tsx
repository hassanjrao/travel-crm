"use client";

import { updateInvoiceStatus } from "@/app/actions/finance";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransition } from "react";

const statuses = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];

export function InvoiceStatusUpdate({
  invoiceId,
  currentStatus,
}: {
  invoiceId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={currentStatus}
      onValueChange={(value) => {
        startTransition(() => updateInvoiceStatus(invoiceId, value));
      }}
      disabled={isPending}
    >
      <SelectTrigger className="w-28 h-7 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
