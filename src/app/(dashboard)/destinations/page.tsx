import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Globe } from "lucide-react";
import { AddDestinationDialog } from "@/components/destinations/add-destination-dialog";

export default async function DestinationsPage() {
  const destinations = await prisma.destination.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { tours: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Destinations</h2>
          <p className="text-sm text-gray-500 mt-1">Manage travel destinations</p>
        </div>
        <AddDestinationDialog>
          <Button>
            <Plus className="h-4 w-4" />
            Add Destination
          </Button>
        </AddDestinationDialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {destinations.length === 0 ? (
          <div className="col-span-4 flex flex-col items-center justify-center py-16 text-gray-400">
            <Globe className="h-10 w-10 mb-2" />
            <p>No destinations yet.</p>
          </div>
        ) : (
          destinations.map((dest: typeof destinations[number]) => (
            <Card key={dest.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{dest.name}</h3>
                    <p className="text-sm text-gray-500">{dest.country}</p>
                  </div>
                  <Badge variant={dest.isActive ? "success" : "secondary"}>
                    {dest.isActive ? "Active" : "Off"}
                  </Badge>
                </div>
                {dest.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{dest.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  {dest._count.tours} tour{dest._count.tours !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
