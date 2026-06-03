"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarCheck,
  Map,
  Globe,
  Building2,
  FileText,
  CreditCard,
  Settings,
  Plane,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: TrendingUp },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Bookings", href: "/bookings", icon: CalendarCheck },
  { label: "Tours", href: "/tours", icon: Map },
  { label: "Destinations", href: "/destinations", icon: Globe },
  { label: "Suppliers", href: "/suppliers", icon: Building2 },
  { label: "Agents", href: "/agents", icon: UserCheck },
  { label: "Invoices", href: "/invoices", icon: FileText },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 text-white">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700">
        <Plane className="h-6 w-6 text-blue-400" />
        <span className="text-lg font-bold tracking-tight">TravelCRM</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-700">
        <p className="px-3 text-xs text-gray-500">v1.0.0</p>
      </div>
    </aside>
  );
}
