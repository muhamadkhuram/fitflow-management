import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGyms, useCreateGym, useUpdateGym } from "@/hooks/useGym";
import { Loader2, Save, Building2 } from "lucide-react";

export default function GymProfile() {
  const { data: gyms, isLoading } = useGyms();
  const activeGym = gyms?.[0];
  const createGym = useCreateGym();
  const updateGym = useUpdateGym();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    fee_type: "monthly",
    fee_amount: "",
  });

  // Update form when gym data loads
  useEffect(() => {
    if (activeGym) {
      setFormData({
        name: activeGym.name || "",
        description: activeGym.description || "",
        address: activeGym.address || "",
        city: activeGym.city || "",
        phone: activeGym.phone || "",
        email: activeGym.email || "",
        fee_type: activeGym.fee_type || "monthly",
        fee_amount: activeGym.fee_amount?.toString() || "",
      });
    }
  }, [activeGym]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const gymData = {
      ...formData,
      fee_amount: parseFloat(formData.fee_amount) || 0,
      fee_type: formData.fee_type as "weekly" | "monthly",
    };

    if (activeGym) {
      updateGym.mutate({ id: activeGym.id, ...gymData });
    } else {
      createGym.mutate(gymData);
    }
  };

  const isPending = createGym.isPending || updateGym.isPending;

  if (isLoading) {
    return (
      <DashboardLayout title="My Gym">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="My Gym" 
      description={activeGym ? "Update your gym profile and settings" : "Create your gym profile"}
    >
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Your gym's essential details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Gym Name *</Label>
                <Input
                  id="name"
                  placeholder="Iron Paradise Gym"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell potential members about your gym..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@yourgym.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Pricing */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Where members can find you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Fitness Street"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Los Angeles, CA"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Membership Pricing</CardTitle>
                <CardDescription>Set your membership fees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fee_type">Billing Cycle</Label>
                    <Select
                      value={formData.fee_type}
                      onValueChange={(value: "weekly" | "monthly") => setFormData({ ...formData, fee_type: value })}
                    >
                      <SelectTrigger id="fee_type">
                        <SelectValue placeholder="Select billing cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee_amount">Fee Amount ($)</Label>
                    <Input
                      id="fee_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="49.99"
                      value={formData.fee_amount}
                      onChange={(e) => setFormData({ ...formData, fee_amount: e.target.value })}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Members will be charged ${formData.fee_amount || "0"} {formData.fee_type}.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" />
            {activeGym ? "Save Changes" : "Create Gym"}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
