import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Dumbbell, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Trash2,
  ExternalLink,
  FolderOpen,
  Star
} from "lucide-react";
import { useGyms } from "@/hooks/useGym";
import { 
  useEquipment, 
  useEquipmentCategories, 
  useEquipmentWishlist,
  useUpdateEquipment,
  useDeleteEquipment,
  useDeleteEquipmentCategory,
  useDeleteWishlistItem,
  EquipmentStatus 
} from "@/hooks/useEquipment";
import { AddEquipmentDialog } from "@/components/AddEquipmentDialog";
import { AddCategoryDialog } from "@/components/AddCategoryDialog";
import { AddWishlistDialog } from "@/components/AddWishlistDialog";
import { EquipmentStatusBadge } from "@/components/EquipmentStatusBadge";
import { cn } from "@/lib/utils";

export default function Equipment() {
  const { data: gyms, isLoading: gymsLoading } = useGyms();
  const activeGym = gyms?.[0];
  const { data: equipment, isLoading: equipmentLoading } = useEquipment(activeGym?.id);
  const { data: categories } = useEquipmentCategories(activeGym?.id);
  const { data: wishlist } = useEquipmentWishlist(activeGym?.id);
  
  const updateEquipment = useUpdateEquipment();
  const deleteEquipment = useDeleteEquipment();
  const deleteCategory = useDeleteEquipmentCategory();
  const deleteWishlistItem = useDeleteWishlistItem();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  if (gymsLoading || equipmentLoading) {
    return (
      <DashboardLayout title="Equipment">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!activeGym) {
    return (
      <DashboardLayout title="Equipment">
        <Card>
          <CardContent className="py-12 text-center">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Create a gym profile first to manage equipment.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const filteredEquipment = equipment?.filter((item) => {
    const categoryMatch = selectedCategory === "all" || item.category_id === selectedCategory;
    const statusMatch = selectedStatus === "all" || item.status === selectedStatus;
    return categoryMatch && statusMatch;
  }) || [];

  const workingCount = equipment?.filter((e) => e.status === "working").length || 0;
  const needsMaintenanceCount = equipment?.filter((e) => e.status === "needs_maintenance").length || 0;
  const underMaintenanceCount = equipment?.filter((e) => e.status === "maintenance").length || 0;
  const outOfOrderCount = equipment?.filter((e) => e.status === "out_of_order").length || 0;

  const handleStatusChange = async (equipmentId: string, newStatus: EquipmentStatus) => {
    await updateEquipment.mutateAsync({
      id: equipmentId,
      gymId: activeGym.id,
      status: newStatus,
      last_maintenance_date: newStatus === "working" && equipment?.find(e => e.id === equipmentId)?.status === "maintenance" 
        ? new Date().toISOString().split("T")[0] 
        : undefined,
    });
  };

  const priorityColors: Record<string, string> = {
    high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };

  return (
    <DashboardLayout 
      title="Equipment" 
      description="Manage your gym equipment, maintenance, and wishlist"
    >
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{workingCount}</p>
                <p className="text-sm text-muted-foreground">Working</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{needsMaintenanceCount}</p>
                <p className="text-sm text-muted-foreground">Needs Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{underMaintenanceCount}</p>
                <p className="text-sm text-muted-foreground">Under Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{outOfOrderCount}</p>
                <p className="text-sm text-muted-foreground">Out of Order</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="equipment" className="space-y-6">
        <TabsList>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="wishlist">
            Wishlist
            {wishlist && wishlist.length > 0 && (
              <Badge variant="secondary" className="ml-2">{wishlist.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Equipment Tab */}
        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Equipment Inventory</CardTitle>
                  <CardDescription>
                    {equipment?.length || 0} total items
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="working">Working</SelectItem>
                      <SelectItem value="needs_maintenance">Needs Maintenance</SelectItem>
                      <SelectItem value="maintenance">Under Maintenance</SelectItem>
                      <SelectItem value="out_of_order">Out of Order</SelectItem>
                    </SelectContent>
                  </Select>
                  <AddEquipmentDialog gymId={activeGym.id} categories={categories || []} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredEquipment.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No equipment found</p>
                  <p className="text-sm">Add your first equipment item to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEquipment.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.quantity > 1 && (
                            <Badge variant="secondary">×{item.quantity}</Badge>
                          )}
                          <EquipmentStatusBadge status={item.status} />
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                          {item.category && (
                            <span className="flex items-center gap-1">
                              <FolderOpen className="h-3 w-3" />
                              {item.category.name}
                            </span>
                          )}
                          {item.brand && <span>• {item.brand}</span>}
                          {item.model && <span>{item.model}</span>}
                        </div>
                        {item.maintenance_notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Note: {item.maintenance_notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={item.status} 
                          onValueChange={(v) => handleStatusChange(item.id, v as EquipmentStatus)}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="working">Working</SelectItem>
                            <SelectItem value="needs_maintenance">Needs Maintenance</SelectItem>
                            <SelectItem value="maintenance">Under Maintenance</SelectItem>
                            <SelectItem value="out_of_order">Out of Order</SelectItem>
                          </SelectContent>
                        </Select>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Equipment?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{item.name}" from your inventory.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteEquipment.mutate({ id: item.id, gymId: activeGym.id })}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Equipment Categories</CardTitle>
                  <CardDescription>
                    Organize your equipment into groups
                  </CardDescription>
                </div>
                <AddCategoryDialog gymId={activeGym.id} />
              </div>
            </CardHeader>
            <CardContent>
              {!categories || categories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No categories yet</p>
                  <p className="text-sm">Create categories to organize your equipment</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((cat) => {
                    const itemCount = equipment?.filter((e) => e.category_id === cat.id).length || 0;
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div>
                          <h4 className="font-medium">{cat.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {itemCount} item{itemCount !== 1 ? "s" : ""}
                          </p>
                          {cat.description && (
                            <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
                          )}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete "{cat.name}". Equipment in this category will become uncategorized.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCategory.mutate({ id: cat.id, gymId: activeGym.id })}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wishlist Tab */}
        <TabsContent value="wishlist">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Equipment Wishlist</CardTitle>
                  <CardDescription>
                    Equipment you'd like to add to your gym
                  </CardDescription>
                </div>
                <AddWishlistDialog gymId={activeGym.id} categories={categories || []} />
              </div>
            </CardHeader>
            <CardContent>
              {!wishlist || wishlist.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your wishlist is empty</p>
                  <p className="text-sm">Add equipment you'd like to purchase</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlist.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium">{item.name}</h4>
                          <Badge 
                            variant="outline" 
                            className={cn(priorityColors[item.priority])}
                          >
                            {item.priority} priority
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                          {item.category && (
                            <span className="flex items-center gap-1">
                              <FolderOpen className="h-3 w-3" />
                              {item.category.name}
                            </span>
                          )}
                          {item.estimated_cost && (
                            <span>• Est. ${Number(item.estimated_cost).toLocaleString()}</span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View
                            </a>
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove from Wishlist?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove "{item.name}" from your wishlist.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteWishlistItem.mutate({ id: item.id, gymId: activeGym.id })}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
