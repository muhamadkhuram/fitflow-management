 import { useState } from "react";
 import { Button } from "@/components/ui/button";
 import { LogOut } from "lucide-react";
 import { useBulkCheckOut, Attendance } from "@/hooks/useAttendance";
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
 
 interface CheckOutAllButtonProps {
   gymId: string;
   activeCheckIns: Attendance[];
 }
 
 export function CheckOutAllButton({ gymId, activeCheckIns }: CheckOutAllButtonProps) {
   const [open, setOpen] = useState(false);
   const bulkCheckOut = useBulkCheckOut();
 
   const handleCheckOutAll = () => {
     const attendanceIds = activeCheckIns.map((a) => a.id);
     bulkCheckOut.mutate(
       { gymId, attendanceIds },
       {
         onSuccess: () => {
           setOpen(false);
         },
       }
     );
   };
 
   return (
     <AlertDialog open={open} onOpenChange={setOpen}>
       <AlertDialogTrigger asChild>
         <Button 
           variant="destructive" 
           disabled={activeCheckIns.length === 0}
         >
           <LogOut className="h-4 w-4 mr-2" />
           Check Out All ({activeCheckIns.length})
         </Button>
       </AlertDialogTrigger>
       <AlertDialogContent>
         <AlertDialogHeader>
           <AlertDialogTitle>Check Out All Members</AlertDialogTitle>
           <AlertDialogDescription>
             This will check out all {activeCheckIns.length} member(s) currently in the gym. 
             This is typically used at the end of the day.
           </AlertDialogDescription>
         </AlertDialogHeader>
         <AlertDialogFooter>
           <AlertDialogCancel>Cancel</AlertDialogCancel>
           <AlertDialogAction
             onClick={handleCheckOutAll}
             disabled={bulkCheckOut.isPending}
             className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
           >
             {bulkCheckOut.isPending ? "Checking out..." : "Check Out All"}
           </AlertDialogAction>
         </AlertDialogFooter>
       </AlertDialogContent>
     </AlertDialog>
   );
 }