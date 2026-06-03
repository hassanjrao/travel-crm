import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  CalendarCheck,
  DollarSign,
  Map,
  UserCheck,
} from "lucide-react";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { BookingStatusChart } from "@/components/charts/booking-status-chart";
import { LeadFunnelChart } from "@/components/charts/lead-funnel-chart";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

async function getDashboardStats() {
  const [
    totalClients,
    totalLeads,
    totalBookings,
    revenueData,
    recentBookings,
    leadsByStatus,
    bookingsByStatus,
    topTours,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.lead.count(),
    prisma.booking.count(),
    prisma.booking.aggregate({
      _sum: { paidAmount: true, totalAmount: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { client: true, tour: true },
    }),
    prisma.lead.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.booking.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.tour.findMany({
      take: 5,
      include: { _count: { select: { bookings: true } } },
      orderBy: { bookings: { _count: "desc" } },
    }),
  ]);

  const monthlyRevenue = await prisma.$queryRaw<{ month: string; revenue: number }[]>`
    SELECT
      TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as month,
      COALESCE(SUM("paidAmount"), 0)::float as revenue
    FROM "Booking"
    WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      AND status != 'CANCELLED'
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY DATE_TRUNC('month', "createdAt")
  `;

  return {
    totalClients,
    totalLeads,
    totalBookings,
    totalRevenue: Number(revenueData._sum.paidAmount ?? 0),
    pendingRevenue:
      Number(revenueData._sum.totalAmount ?? 0) - Number(revenueData._sum.paidAmount ?? 0),
    recentBookings,
    leadsByStatus,
    bookingsByStatus,
    monthlyRevenue,
    topTours,
  };
}

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "info" | "secondary"> = {
  CONFIRMED: "success",
  COMPLETED: "info",
  PENDING: "warning",
  CANCELLED: "destructive",
  IN_PROGRESS: "default",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const kpis = [
    {
      title: "Total Clients",
      value: stats.totalClients.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active Leads",
      value: stats.totalLeads.toLocaleString(),
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toLocaleString(),
      icon: CalendarCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Revenue Collected",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ title, value, icon: Icon, color, bg }) => (
          <Card key={title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart data={stats.monthlyRevenue} />
        </div>
        <BookingStatusChart data={stats.bookingsByStatus} />
      </div>

      {/* Lead Funnel + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LeadFunnelChart data={stats.leadsByStatus} />

        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Bookings</CardTitle>
                <Link href="/bookings" className="text-sm text-blue-600 hover:underline">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentBookings.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No bookings yet</p>
                ) : (
                  stats.recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <CalendarCheck className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.client.firstName} {booking.client.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{booking.tour.title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={statusColors[booking.status] ?? "secondary"}>
                          {booking.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(booking.travelDate)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Tours */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Top Tours by Bookings</CardTitle>
            <Link href="/tours" className="text-sm text-blue-600 hover:underline">
              Manage tours
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topTours.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No tours yet</p>
            ) : (
              stats.topTours.map((tour) => (
                <div
                  key={tour.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Map className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tour.title}</p>
                      <p className="text-xs text-gray-500">{tour.duration} days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {tour._count.bookings} bookings
                    </p>
                    <p className="text-xs text-gray-500">{formatCurrency(tour.pricePerPerson)}/person</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
