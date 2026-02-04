import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AddTrainerDialog } from "@/components/AddTrainerDialog";
import { useTrainers } from "@/hooks/useTrainers";
import { Mail, Phone, Calendar, Trash2, Edit2, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Trainers() {
  const { trainers, isLoading, deleteTrainer } = useTrainers();

  return (
    <DashboardLayout title="Trainers" description="Manage your gym instructors and their details.">
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <AddTrainerDialog />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-4 flex-row items-center gap-4 space-y-0">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))
          ) : trainers?.length === 0 ? (
            <Card className="md:col-span-2 lg:col-span-3 py-12">
              <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">No trainers found</h3>
                  <p className="text-sm text-muted-foreground">
                    Get started by adding your first gym trainer.
                  </p>
                </div>
                <AddTrainerDialog />
              </CardContent>
            </Card>
          ) : (
            trainers?.map((trainer) => (
              <Card key={trainer.id} className="overflow-hidden group hover:border-primary/50 transition-colors">
                <CardHeader className="p-4 flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                      <AvatarImage src={trainer.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {trainer.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <CardTitle className="text-lg truncate">{trainer.full_name}</CardTitle>
                      <p className="text-xs text-muted-foreground capitalize">
                        {trainer.wage_type} • ${trainer.wage_amount}
                      </p>
                    </div>
                  </div>
                  <Badge variant={trainer.is_active ? "default" : "secondary"}>
                    {trainer.is_active ? "Active" : "Inactive"}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {trainer.specializations?.map((spec, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                        {spec}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    {trainer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{trainer.email}</span>
                      </div>
                    )}
                    {trainer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{trainer.phone}</span>
                      </div>
                    )}
                    {trainer.hire_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Joined {new Date(trainer.hire_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {trainer.bio && (
                    <p className="text-sm line-clamp-2 text-foreground/80 italic">
                      "{trainer.bio}"
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                      if (confirm("Are you sure you want to delete this trainer?")) {
                        deleteTrainer.mutate(trainer.id);
                      }
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
