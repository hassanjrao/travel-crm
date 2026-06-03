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
import { createTour } from "@/app/actions/tours";

interface Props {
  children: React.ReactNode;
  destinations: { id: string; name: string; country: string }[];
}

export function AddTourDialog({ children, destinations }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [destinationId, setDestinationId] = useState("");

  function handleSubmit(formData: FormData) {
    formData.set("destinationId", destinationId);
    startTransition(async () => {
      const result = await createTour(formData);
      if (result?.success) setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Tour Package</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Tour Title *</Label>
            <Input id="title" name="title" required placeholder="e.g. Bali Cultural Discovery" />
          </div>

          <div className="space-y-1.5">
            <Label>Destination *</Label>
            <Select onValueChange={setDestinationId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select destination..." />
              </SelectTrigger>
              <SelectContent>
                {destinations.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}, {d.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="duration">Duration (days) *</Label>
              <Input id="duration" name="duration" type="number" min="1" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxGroupSize">Max Group</Label>
              <Input id="maxGroupSize" name="maxGroupSize" type="number" defaultValue="15" min="1" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pricePerPerson">Price/Person *</Label>
              <Input id="pricePerPerson" name="pricePerPerson" type="number" step="0.01" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://..." />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !destinationId}>
              {isPending ? "Adding..." : "Add Tour"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
