import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Map, Clock, Users, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AddTourDialog } from "@/components/tours/add-tour-dialog";
import { TourToggle } from "@/components/tours/tour-toggle";
import Link from "next/link";

export default async function ToursPage() {
  const [tours, destinations] = await Promise.all([
    prisma.tour.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        destination: { select: { name: true, country: true } },
        _count: { select: { bookings: true } },
      },
    }),
    prisma.destination.findMany({
      select: { id: true, name: true, country: true },
      where: { isActive: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tour Packages</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your tour catalog</p>
        </div>
        <AddTourDialog destinations={destinations}>
          <Button>
            <Plus className="h-4 w-4" />
            Add Tour
          </Button>
        </AddTourDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tours.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-16 text-gray-400">
            <Map className="h-10 w-10 mb-2" />
            <p>No tours yet. Add your first tour package.</p>
          </div>
        ) : (
          tours.map((tour: typeof tours[number]) => (
            <Card key={tour.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base leading-snug">{tour.title}</CardTitle>
                    <p className="text-xs text-gray-500 mt-1">
                      {tour.destination.name}, {tour.destination.country}
                    </p>
                  </div>
                  <Badge variant={tour.isActive ? "success" : "secondary"}>
                    {tour.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {tour.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{tour.description}</p>
                )}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    {tour.duration} days
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    Max {tour.maxGroupSize}
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-blue-600">
                    <DollarSign className="h-3.5 w-3.5" />
                    {formatCurrency(tour.pricePerPerson.toString())}/person
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    {tour._count.bookings} booking{tour._count.bookings !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <TourToggle tourId={tour.id} isActive={tour.isActive} />
                  <Link href={`/tours/${tour.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
