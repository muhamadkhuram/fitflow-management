import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  UserPlus, 
  CreditCard, 
  Dumbbell,
  ClipboardCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { Logo } from "./Logo";
import { useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Building2, label: "My Gym", path: "/dashboard/gym" },
  { icon: Users, label: "Members", path: "/dashboard/members" },
  { icon: UserPlus, label: "Requests", path: "/dashboard/requests" },
  { icon: CreditCard, label: "Payments", path: "/dashboard/payments" },
  { icon: Dumbbell, label: "Equipment", path: "/dashboard/equipment" },
  { icon: ClipboardCheck, label: "Attendance", path: "/dashboard/attendance" },
  { icon: UserCheck, label: "Trainers", path: "/dashboard/trainers" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export function DashboardSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Gym Owner";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className={cn(
          "flex h-16 items-center border-b border-sidebar-border px-4",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <Logo size="sm" showText={!collapsed} />
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent hidden md:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-primary" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-sidebar-primary")} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className={cn(
          "border-t border-sidebar-border p-4",
          collapsed && "flex justify-center"
        )}>
          <div className={cn(
            "flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3",
            collapsed && "p-2"
          )}>
            <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-semibold text-sm">
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
