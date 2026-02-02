import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGyms, useGymMembers } from "@/hooks/useGym";
import { usePayments, useDeletePayment } from "@/hooks/usePayments";
import { AddPaymentDialog } from "@/components/AddPaymentDialog";
import { 
  CreditCard, 
  DollarSign,
  AlertCircle,
  TrendingUp,
  Calendar,
  Banknote,
  Building,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Payments() {
  const { data: gyms } = useGyms();
  const activeGym = gyms?.[0];
  const { data: members } = useGymMembers(activeGym?.id);
  const { data: payments, isLoading: paymentsLoading } = usePayments(activeGym?.id);
  const deletePayment = useDeletePayment();

  const activeMembers = members?.filter(m => m.is_active) || [];
  const monthlyRevenue = activeGym 
    ? activeMembers.length * Number(activeGym.fee_amount)
    : 0;

  const totalCollected = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  const handleDeletePayment = (paymentId: string, memberId: string) => {
    if (activeGym && confirm("Are you sure you want to delete this payment?")) {
      deletePayment.mutate({ id: paymentId, gymId: activeGym.id, memberId });
    }
  };

  if (!activeGym) {
    return (
      <DashboardLayout title="Payments">
        <Card className="text-center py-12">
          <CardContent>
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Please create a gym profile first.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Payments" 
      description="Manage billing and payment settings"
    >
      <div className="space-y-6">
        {/* Revenue Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expected Revenue</p>
                <p className="mt-2 text-3xl font-bold">${monthlyRevenue.toLocaleString()}</p>
                <p className="mt-1 text-sm text-muted-foreground">per {activeGym.fee_type}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Collected</p>
                <p className="mt-2 text-3xl font-bold text-success">${totalCollected.toLocaleString()}</p>
                <p className="mt-1 text-sm text-muted-foreground">{payments?.length || 0} payments</p>
              </div>
              <div className="rounded-lg bg-success/10 p-3">
                <Banknote className="h-6 w-6 text-success" />
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                <p className="mt-2 text-3xl font-bold">{activeMembers.length}</p>
                <p className="mt-1 text-sm text-success">All payments current</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>All recorded payments</CardDescription>
              </div>
              <AddPaymentDialog gymId={activeGym.id} />
            </div>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : payments && payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        payment.payment_type === 'cash' 
                          ? 'bg-success/10 text-success' 
                          : payment.payment_type === 'transfer'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-accent/10 text-accent'
                      }`}>
                        {payment.payment_type === 'cash' ? (
                          <Banknote className="h-5 w-5" />
                        ) : payment.payment_type === 'transfer' ? (
                          <Building className="h-5 w-5" />
                        ) : (
                          <CreditCard className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{payment.member?.full_name || "Unknown Member"}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payment.payment_date), "MMM d, yyyy")}
                          {" • "}
                          <span className="capitalize">{payment.payment_type}</span>
                          {payment.description && ` • ${payment.description}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-success">
                        +${Number(payment.amount).toFixed(2)}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeletePayment(payment.id, payment.member_id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Payment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No payments recorded yet</p>
                <p className="text-sm">Add your first payment using the button above</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stripe Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Stripe Integration</CardTitle>
                <CardDescription>Connect Stripe to automate member payments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border-2 border-dashed border-muted p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Stripe Integration Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                We're working on integrating Stripe to automatically collect {activeGym.fee_type} 
                payments from your members. Stay tuned!
              </p>
              <Button disabled>
                <CreditCard className="h-4 w-4" />
                Connect Stripe
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Settings</CardTitle>
            <CardDescription>Configure how members are billed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">Billing Cycle</p>
                  <p className="text-sm text-muted-foreground">Members are charged {activeGym.fee_type}</p>
                </div>
                <span className="text-sm font-medium text-primary capitalize">{activeGym.fee_type}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">Membership Fee</p>
                  <p className="text-sm text-muted-foreground">Standard membership rate</p>
                </div>
                <span className="text-sm font-medium text-primary">${Number(activeGym.fee_amount).toFixed(2)}</span>
              </div>
              <Button variant="outline" asChild>
                <Link to="/dashboard/gym">Update Pricing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
