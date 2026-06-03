"use client";

import { toggleTourStatus } from "@/app/actions/tours";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";

export function TourToggle({ tourId, isActive }: { tourId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant={isActive ? "outline" : "secondary"}
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => toggleTourStatus(tourId, !isActive))}
    >
      {isPending ? "..." : isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}
