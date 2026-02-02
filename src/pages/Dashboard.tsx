import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGyms, useGymMembers, useJoinRequests } from "@/hooks/useGym";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  UserPlus, 
  DollarSign, 
  TrendingUp,
  ArrowRight,
  Building2
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: gyms, isLoading: gymsLoading } = useGyms();
  const activeGym = gyms?.[0];
  const { data: members } = useGymMembers(activeGym?.id);
  const { data: requests } = useJoinRequests(activeGym?.id);

  const pendingRequests = requests?.filter(r => r.status === "pending") || [];
  const activeMembers = members?.filter(m => m.is_active) || [];
  const monthlyRevenue = activeGym 
    ? activeMembers.length * Number(activeGym.fee_amount)
    : 0;

  if (gymsLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!activeGym) {
    return (
      <DashboardLayout 
        title="Welcome to M4Gym" 
        description="Let's set up your gym profile to get started"
      >
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create Your Gym Profile</CardTitle>
            <CardDescription>
              Set up your gym details, configure pricing, and start accepting members.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button size="lg" asChild>
              <Link to="/dashboard/gym">
                Create Gym Profile
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Dashboard" 
      description={`Welcome back! Here's what's happening at ${activeGym.name}`}
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          icon={Users}
          label="Active Members"
          value={activeMembers.length}
          change="+12% from last month"
          changeType="positive"
        />
        <StatCard
          icon={UserPlus}
          label="Pending Requests"
          value={pendingRequests.length}
          change={pendingRequests.length > 0 ? "Needs attention" : "All caught up"}
          changeType={pendingRequests.length > 0 ? "neutral" : "positive"}
        />
        <StatCard
          icon={DollarSign}
          label="Monthly Revenue"
          value={`$${monthlyRevenue.toLocaleString()}`}
          change="+8% from last month"
          changeType="positive"
        />
        <StatCard
          icon={TrendingUp}
          label="Growth Rate"
          value="23%"
          change="Excellent performance"
          changeType="positive"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Requests */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Join Requests</CardTitle>
              <CardDescription>People who want to join your gym</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/requests">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.slice(0, 3).map((request) => (
                  <div 
                    key={request.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {request.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{request.full_name}</p>
                        <p className="text-sm text-muted-foreground">{request.email}</p>
                      </div>
                    </div>
                    <span className="badge-pending text-xs px-2 py-1 rounded-full border">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gym Info */}
        <Card>
          <CardHeader>
            <CardTitle>Your Gym</CardTitle>
            <CardDescription>Quick overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Gym Name</p>
              <p className="font-medium">{activeGym.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Membership Fee</p>
              <p className="font-medium">
                ${Number(activeGym.fee_amount).toFixed(2)} / {activeGym.fee_type}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span className={`inline-flex items-center gap-1.5 text-sm ${activeGym.is_active ? 'text-success' : 'text-muted-foreground'}`}>
                <span className={`h-2 w-2 rounded-full ${activeGym.is_active ? 'bg-success' : 'bg-muted-foreground'}`} />
                {activeGym.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <Button className="w-full" variant="outline" asChild>
              <Link to="/dashboard/gym">
                Manage Gym
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
