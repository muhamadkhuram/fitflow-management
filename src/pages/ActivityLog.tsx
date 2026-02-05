 import { DashboardLayout } from "@/components/DashboardLayout";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { useGyms } from "@/hooks/useGym";
 import { useActivityLogs } from "@/hooks/useActivityLog";
 import { ActivityLogList } from "@/components/ActivityLogList";
 import { Activity } from "lucide-react";
 
 export default function ActivityLog() {
   const { data: gyms, isLoading: gymsLoading } = useGyms();
   const gym = gyms?.[0];
   
   const { data: logs = [], isLoading: logsLoading } = useActivityLogs(gym?.id);
 
   if (gymsLoading) {
     return (
       <DashboardLayout title="Activity Log">
         <div className="flex items-center justify-center h-64">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
         </div>
       </DashboardLayout>
     );
   }
 
   if (!gym) {
     return (
       <DashboardLayout title="Activity Log">
         <Card className="text-center py-12">
           <CardContent>
             <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
             <p className="text-muted-foreground">Please create a gym first.</p>
           </CardContent>
         </Card>
       </DashboardLayout>
     );
   }
 
   return (
     <DashboardLayout title="Activity Log" description="Track all actions in your gym">
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Activity className="h-5 w-5" />
             Recent Activity
           </CardTitle>
           <CardDescription>
             A log of all actions performed in your gym
           </CardDescription>
         </CardHeader>
         <CardContent>
           <ActivityLogList logs={logs} isLoading={logsLoading} />
         </CardContent>
       </Card>
     </DashboardLayout>
   );
 }