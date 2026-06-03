import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Clock, Users, DollarSign, Map } from "lucide-react";

export default async function TourDetailPage(props: PageProps<"/tours/[id]">) {
  const { id } = await props.params;

  const tour = await prisma.tour.findUnique({
    where: { id },
    include: {
      destination: true,
      itineraries: { orderBy: { dayNumber: "asc" } },
      bookings: {
        include: { client: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { bookings: true } },
    },
  });

  if (!tour) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/tours">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{tour.title}</h2>
          <p className="text-sm text-gray-500">
            {tour.destination.name}, {tour.destination.country}
          </p>
        </div>
        <Badge variant={tour.isActive ? "success" : "secondary"}>
          {tour.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: "Duration", value: `${tour.duration} days`, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Users, label: "Max Group", value: `${tour.maxGroupSize} pax`, color: "text-purple-600", bg: "bg-purple-50" },
          { icon: DollarSign, label: "Price/Person", value: formatCurrency(tour.pricePerPerson.toString()), color: "text-green-600", bg: "bg-green-50" },
          { icon: Map, label: "Total Bookings", value: tour._count.bookings.toString(), color: "text-orange-600", bg: "bg-orange-50" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`font-semibold ${color}`}>{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tour.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">{tour.description}</p>
            </CardContent>
          </Card>
        )}

        {(tour.includes.length > 0 || tour.excludes.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Includes / Excludes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tour.includes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-green-600 uppercase mb-1">Included</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {tour.includes.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tour.excludes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-500 uppercase mb-1">Excluded</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {tour.excludes.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-red-400">✗</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Itinerary */}
      {tour.itineraries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Itinerary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tour.itineraries.map((day: typeof tour.itineraries[number]) => (
              <div key={day.id} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">D{day.dayNumber}</span>
                </div>
                <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
                  <p className="font-semibold text-gray-900">{day.title}</p>
                  {day.description && <p className="text-sm text-gray-600 mt-1">{day.description}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent bookings */}
      {tour.bookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Ref", "Client", "Travel Date", "Group"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tour.bookings.map((b: typeof tour.bookings[number]) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/bookings/${b.id}`} className="font-mono text-xs text-blue-600 hover:underline">
                        {b.bookingRef}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {b.client.firstName} {b.client.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(b.travelDate)}</td>
                    <td className="px-4 py-3 text-gray-600">{b.groupSize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
