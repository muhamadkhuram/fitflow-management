import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGyms, useJoinRequests, useUpdateJoinRequest } from "@/hooks/useGym";
import { 
  UserPlus, 
  Check, 
  X, 
  Clock,
  Mail,
  MessageSquare,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Requests() {
  const { data: gyms } = useGyms();
  const activeGym = gyms?.[0];
  const { data: requests, isLoading } = useJoinRequests(activeGym?.id);
  const updateRequest = useUpdateJoinRequest();

  const pendingRequests = requests?.filter(r => r.status === "pending") || [];
  const processedRequests = requests?.filter(r => r.status !== "pending") || [];

  const handleUpdateRequest = (requestId: string, status: "approved" | "rejected") => {
    if (activeGym) {
      updateRequest.mutate({ id: requestId, status, gymId: activeGym.id });
    }
  };

  if (!activeGym) {
    return (
      <DashboardLayout title="Join Requests">
        <Card className="text-center py-12">
          <CardContent>
            <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Please create a gym profile first.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Join Requests" 
      description="Review and manage membership requests"
    >
      <div className="space-y-6">
        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>
                  {pendingRequests.length} request{pendingRequests.length !== 1 ? "s" : ""} awaiting review
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <Check className="h-12 w-12 mx-auto text-success mb-4" />
                <p className="text-muted-foreground">All caught up! No pending requests.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div 
                    key={request.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-semibold text-primary">
                          {request.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-lg">{request.full_name}</p>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {request.email}
                          </span>
                          {request.phone && (
                            <span>• {request.phone}</span>
                          )}
                        </div>
                        {request.message && (
                          <div className="mt-3 p-3 rounded-lg bg-muted/50">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <p className="text-sm">{request.message}</p>
                            </div>
                          </div>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">
                          Requested {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 lg:flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 lg:flex-none text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleUpdateRequest(request.id, "rejected")}
                        disabled={updateRequest.isPending}
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        className="flex-1 lg:flex-none"
                        onClick={() => handleUpdateRequest(request.id, "approved")}
                        disabled={updateRequest.isPending}
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Previously processed requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {processedRequests.slice(0, 10).map((request) => (
                  <div 
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {request.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{request.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(request.updated_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full border font-medium",
                      request.status === "approved" ? "badge-approved" : "badge-rejected"
                    )}>
                      {request.status === "approved" ? "Approved" : "Rejected"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
