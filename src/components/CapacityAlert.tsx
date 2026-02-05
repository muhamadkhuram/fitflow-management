 import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
 import { AlertTriangle, Users } from "lucide-react";
 import { Progress } from "@/components/ui/progress";
 
 interface CapacityAlertProps {
   currentCount: number;
   capacity: number | null;
 }
 
 export function CapacityAlert({ currentCount, capacity }: CapacityAlertProps) {
   if (!capacity) return null;
 
   const percentage = Math.round((currentCount / capacity) * 100);
   const isNearCapacity = percentage >= 80;
   const isAtCapacity = percentage >= 100;
 
   if (!isNearCapacity) return null;
 
   return (
     <Alert variant={isAtCapacity ? "destructive" : "default"} className="border-warning bg-warning/10">
       <AlertTriangle className={`h-4 w-4 ${isAtCapacity ? "text-destructive" : "text-warning"}`} />
       <AlertTitle className={isAtCapacity ? "text-destructive" : "text-warning"}>
         {isAtCapacity ? "At Capacity!" : "Approaching Capacity"}
       </AlertTitle>
       <AlertDescription className="space-y-2">
         <div className="flex items-center justify-between text-sm">
           <span className="flex items-center gap-1">
             <Users className="h-4 w-4" />
             {currentCount} / {capacity} members present
           </span>
           <span className="font-medium">{percentage}%</span>
         </div>
         <Progress 
           value={Math.min(percentage, 100)} 
           className={`h-2 ${isAtCapacity ? "[&>div]:bg-destructive" : "[&>div]:bg-warning"}`}
         />
       </AlertDescription>
     </Alert>
   );
 }