 import { format, formatDistanceToNow } from "date-fns";
 import { ActivityLog } from "@/hooks/useActivityLog";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import {
   UserPlus,
   UserMinus,
   LogIn,
   LogOut,
   DollarSign,
   Settings,
   Dumbbell,
   UserCheck,
   Activity,
 } from "lucide-react";
 
 interface ActivityLogListProps {
   logs: ActivityLog[];
   isLoading?: boolean;
 }
 
 const actionIcons: Record<string, any> = {
   check_in: LogIn,
   check_out: LogOut,
   bulk_check_in: LogIn,
   bulk_check_out: LogOut,
   member_added: UserPlus,
   member_removed: UserMinus,
   payment_added: DollarSign,
   trainer_added: UserCheck,
   trainer_removed: UserMinus,
   equipment_added: Dumbbell,
   settings_updated: Settings,
 };
 
 const actionColors: Record<string, string> = {
   check_in: "bg-success/10 text-success",
   check_out: "bg-muted text-muted-foreground",
   bulk_check_in: "bg-success/10 text-success",
   bulk_check_out: "bg-muted text-muted-foreground",
   member_added: "bg-primary/10 text-primary",
   member_removed: "bg-destructive/10 text-destructive",
   payment_added: "bg-success/10 text-success",
   trainer_added: "bg-primary/10 text-primary",
   trainer_removed: "bg-destructive/10 text-destructive",
   equipment_added: "bg-accent/10 text-accent-foreground",
   settings_updated: "bg-muted text-muted-foreground",
 };
 
 function formatAction(action: string): string {
   return action
     .split("_")
     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
     .join(" ");
 }
 
 export function ActivityLogList({ logs, isLoading }: ActivityLogListProps) {
   if (isLoading) {
     return (
       <div className="flex items-center justify-center py-8">
         <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
       </div>
     );
   }
 
   if (logs.length === 0) {
     return (
       <div className="text-center py-8 text-muted-foreground">
         <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
         <p>No activity recorded yet</p>
       </div>
     );
   }
 
   return (
     <ScrollArea className="h-[400px]">
       <div className="space-y-3 pr-4">
         {logs.map((log) => {
           const Icon = actionIcons[log.action] || Activity;
           const colorClass = actionColors[log.action] || "bg-muted text-muted-foreground";
 
           return (
             <div
               key={log.id}
               className="flex items-start gap-3 p-3 rounded-lg border bg-card"
             >
               <div className={`p-2 rounded-lg ${colorClass}`}>
                 <Icon className="h-4 w-4" />
               </div>
               <div className="flex-1 min-w-0">
                 <p className="font-medium text-sm">
                   {formatAction(log.action)}
                   {log.entity_name && (
                     <span className="text-muted-foreground font-normal">
                       {" "}• {log.entity_name}
                     </span>
                   )}
                 </p>
                 <p className="text-xs text-muted-foreground">
                   {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                 </p>
               </div>
               <span className="text-xs text-muted-foreground whitespace-nowrap">
                 {format(new Date(log.created_at), "h:mm a")}
               </span>
             </div>
           );
         })}
       </div>
     </ScrollArea>
   );
 }