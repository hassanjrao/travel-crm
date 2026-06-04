"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, UserCheck, CalendarCheck, Map,
  Globe, Building2, FileText, CreditCard, Settings,
  Plane, TrendingUp, Menu, X, LogOut, Bell, User,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

function SidebarContent({
  collapsed,
  onClose,
  onCollapse,
  isDesktop,
}: {
  collapsed: boolean;
  onClose?: () => void;
  onCollapse?: () => void;
  isDesktop?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-hidden">
      {/* Logo + collapse button */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <Plane className="h-6 w-6 text-blue-400 flex-shrink-0" />
            <span className="text-lg font-bold tracking-tight truncate">TravelCRM</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto">
            <Plane className="h-6 w-6 text-blue-400" />
          </div>
        )}

        {/* Desktop collapse toggle */}
        {isDesktop && onCollapse && (
          <button
            onClick={onCollapse}
            className={cn(
              "text-gray-400 hover:text-white p-1 rounded transition-colors flex-shrink-0",
              collapsed && "mx-auto"
            )}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform duration-200", collapsed && "rotate-180")} />
          </button>
        )}

        {/* Mobile close button */}
        {!isDesktop && onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="px-4 py-4 border-t border-gray-700 flex-shrink-0">
          <p className="text-xs text-gray-500">v1.0.0</p>
        </div>
      )}
    </div>
  );
}

interface LayoutShellProps {
  children: React.ReactNode;
  userName: string;
  userRole: string;
}

export function LayoutShell({ children, userName, userRole }: LayoutShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col flex-shrink-0 transition-all duration-300",
          desktopCollapsed ? "lg:w-16" : "lg:w-64"
        )}
      >
        <SidebarContent
          collapsed={desktopCollapsed}
          onCollapse={() => setDesktopCollapsed((v) => !v)}
          isDesktop
        />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 flex flex-col lg:hidden transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent
          collapsed={false}
          onClose={() => setMobileOpen(false)}
        />
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop sidebar toggle (shown when sidebar is collapsed) */}
            {desktopCollapsed && (
              <button
                className="hidden lg:flex p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
                onClick={() => setDesktopCollapsed(false)}
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            <div className="flex items-center gap-2 lg:hidden">
              <Plane className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-gray-900">TravelCRM</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 leading-none">{userName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{userRole}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-gray-500 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
