import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Shield } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "AGENT";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your account and application preferences</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Account Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Name</span>
            <span className="text-sm font-medium text-gray-900">{session?.user?.name}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm font-medium text-gray-900">{session?.user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-500">Role</span>
            <Badge variant={role === "ADMIN" ? "default" : "secondary"}>{role}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Permissions</CardTitle>
          </div>
          <CardDescription>Your access level based on your role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {[
              { label: "View Dashboard", allowed: true },
              { label: "Manage Leads", allowed: true },
              { label: "Manage Clients", allowed: true },
              { label: "Manage Bookings", allowed: true },
              { label: "Manage Tours & Destinations", allowed: true },
              { label: "View Invoices & Payments", allowed: true },
              { label: "Manage Suppliers", allowed: true },
              { label: "Manage Agents (Admin only)", allowed: role === "ADMIN" },
              { label: "System Settings (Admin only)", allowed: role === "ADMIN" },
            ].map(({ label, allowed }) => (
              <div key={label} className="flex items-center justify-between py-1">
                <span className="text-gray-600">{label}</span>
                <Badge variant={allowed ? "success" : "secondary"}>{allowed ? "Allowed" : "Restricted"}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-base">Database Setup</CardTitle>
          </div>
          <CardDescription>Configure your PostgreSQL connection</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>Update your <code className="bg-gray-100 px-1 rounded">.env</code> file with your PostgreSQL credentials:</p>
          <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
{`DATABASE_URL="postgresql://user:password@localhost:5432/travel_crm"
AUTH_SECRET="your-32-char-secret-here"
NEXTAUTH_URL="http://localhost:3000"`}
          </pre>
          <p className="text-xs text-gray-400">Then run: <code className="bg-gray-100 px-1 rounded">npx prisma db push && npx prisma db seed</code></p>
        </CardContent>
      </Card>
    </div>
  );
}
