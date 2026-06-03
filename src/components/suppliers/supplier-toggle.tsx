"use client";

import { toggleSupplierStatus } from "@/app/actions/suppliers";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";

export function SupplierToggle({ supplierId, isActive }: { supplierId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => toggleSupplierStatus(supplierId, !isActive))}
      className={isActive ? "text-red-500 hover:text-red-600" : "text-green-600 hover:text-green-700"}
    >
      {isPending ? "..." : isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}
