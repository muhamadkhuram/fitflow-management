import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGyms, useGymMembers, useUpdateMemberTag } from "@/hooks/useGym";
import { useMemberPayments, useAddPayment } from "@/hooks/usePayments";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { MemberTagBadge } from "@/components/MemberTagBadge";
import {
  ArrowLeft,
  Camera,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  CreditCard,
  Banknote,
  Building,
  Loader2,
  Plus,
  Crown,
  Star,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MemberDetail() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: gyms } = useGyms();
  const activeGym = gyms?.[0];
  const { data: members } = useGymMembers(activeGym?.id);
  const member = members?.find(m => m.id === memberId);
  const { data: payments, isLoading: paymentsLoading } = useMemberPayments(memberId);
  const addPayment = useAddPayment();
  const updateTag = useUpdateMemberTag();

  const [uploading, setUploading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState<"cash" | "transfer">("cash");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleTagChange = (tag: "beginner" | "regular" | "vip") => {
    if (!activeGym || !memberId) return;
    updateTag.mutate({ memberId, gymId: activeGym.id, tag });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !member || !activeGym) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${activeGym.id}/${member.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('member-avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('member-avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('gym_members')
        .update({ avatar_url: publicUrl })
        .eq('id', member.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["gym-members", activeGym.id] });
      toast.success("Photo updated successfully!");
    } catch (error: any) {
      toast.error("Failed to upload photo: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGym || !memberId) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    await addPayment.mutateAsync({
      gymId: activeGym.id,
      memberId,
      amount,
      paymentType,
      description: paymentDescription || undefined,
      paymentDate: new Date(paymentDate).toISOString(),
    });

    setPaymentDialogOpen(false);
    setPaymentAmount("");
    setPaymentDescription("");
    setPaymentDate(format(new Date(), "yyyy-MM-dd"));
  };

  if (!member) {
    return (
      <DashboardLayout title="Member Details">
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">Member not found</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const totalPayments = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  return (
    <DashboardLayout title="Member Details">
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Members
        </Button>

        {/* Member Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar Section */}
              <div className="relative group">
                <div className="h-32 w-32 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
                  {(member as any).avatar_url ? (
                    <img 
                      src={(member as any).avatar_url} 
                      alt={member.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-primary">
                      {member.full_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  ) : (
                    <Camera className="h-8 w-8 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Member Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">{member.full_name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm px-2 py-1 rounded-full ${member.is_active ? 'badge-approved' : 'badge-rejected'}`}>
                      {member.is_active ? "Active" : "Inactive"}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-auto p-0">
                          <MemberTagBadge tag={(member as any).tag} className="cursor-pointer hover:opacity-80" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleTagChange("beginner")}>
                          <User className="h-4 w-4 mr-2" />
                          Beginner
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTagChange("regular")}>
                          <Star className="h-4 w-4 mr-2" />
                          Regular
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTagChange("vip")}>
                          <Crown className="h-4 w-4 mr-2" />
                          VIP
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-5 w-5" />
                    <span>{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone className="h-5 w-5" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                    <span>Joined {format(new Date(member.joined_at), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <DollarSign className="h-5 w-5" />
                    <span>Total Paid: ${totalPayments.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>All payments from this member</CardDescription>
              </div>
              <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Manual Payment</DialogTitle>
                    <DialogDescription>
                      Add a cash or transfer payment for {member.full_name}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddPayment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Payment Type</Label>
                      <Select value={paymentType} onValueChange={(v) => setPaymentType(v as "cash" | "transfer")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">
                            <div className="flex items-center gap-2">
                              <Banknote className="h-4 w-4" />
                              Cash
                            </div>
                          </SelectItem>
                          <SelectItem value="transfer">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              Bank Transfer
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Payment Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Input
                        id="description"
                        placeholder="e.g., Monthly membership"
                        value={paymentDescription}
                        onChange={(e) => setPaymentDescription(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addPayment.isPending}>
                        {addPayment.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Add Payment"
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                        <p className="font-medium capitalize">{payment.payment_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payment.payment_date), "MMM d, yyyy")}
                          {payment.description && ` • ${payment.description}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-success">
                      +${Number(payment.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No payments recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
