import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, LogOut, Clock, Users, Trash2 } from "lucide-react";
import { useGyms, useGymMembers } from "@/hooks/useGym";
import { useAttendance, useActiveCheckIns, useCheckOut, useDeleteAttendance } from "@/hooks/useAttendance";
import { CheckInDialog } from "@/components/CheckInDialog";
import { BulkCheckInDialog } from "@/components/BulkCheckInDialog";
import { BulkCheckOutDialog } from "@/components/BulkCheckOutDialog";
 import { AttendanceChart } from "@/components/AttendanceChart";
 import { CheckOutAllButton } from "@/components/CheckOutAllButton";
import { CapacityAlert } from "@/components/CapacityAlert";
import { cn } from "@/lib/utils";
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

export default function Attendance() {
  const { data: gyms, isLoading: gymsLoading } = useGyms();
  const gym = gyms?.[0];
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const { data: members = [] } = useGymMembers(gym?.id);
  const { data: activeCheckIns = [], isLoading: activeLoading } = useActiveCheckIns(gym?.id);
  const { data: attendance = [], isLoading: attendanceLoading } = useAttendance(gym?.id, selectedDate);
  
  const checkOut = useCheckOut();
  const deleteAttendance = useDeleteAttendance();

  const activeCheckInMemberIds = activeCheckIns.map((a) => a.member_id);

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  const formatDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return "Ongoing";
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (gymsLoading) {
    return (
      <DashboardLayout title="Attendance">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!gym) {
    return (
      <DashboardLayout title="Attendance">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Gym Found</h2>
          <p className="text-muted-foreground">Please create a gym first to track attendance.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Attendance" description="Track member check-ins and check-outs">
      <div className="space-y-6">
        {/* Header with Check In Buttons */}
        <div className="flex flex-wrap justify-end gap-2">
          <CheckOutAllButton gymId={gym.id} activeCheckIns={activeCheckIns} />
          <BulkCheckOutDialog gymId={gym.id} activeCheckIns={activeCheckIns} />
          <BulkCheckInDialog 
            gymId={gym.id} 
            members={members} 
            activeCheckIns={activeCheckInMemberIds} 
          />
          <CheckInDialog 
            gymId={gym.id} 
            members={members} 
            activeCheckIns={activeCheckInMemberIds} 
          />
        </div>

        {/* Capacity Alert */}
        <CapacityAlert currentCount={activeCheckIns.length} capacity={gym.capacity} />

        {/* Attendance Chart */}
        <AttendanceChart gymId={gym.id} />
 
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currently Present</p>
                  <p className="text-2xl font-bold">{activeCheckIns.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Visits</p>
                  <p className="text-2xl font-bold">
                    {attendance.filter((a) => {
                      const today = new Date();
                      const checkIn = new Date(a.check_in_time);
                      return checkIn.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/50 flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold">{members.filter((m) => m.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              Currently Present ({activeCheckIns.length})
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Active Check-ins */}
          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Members Currently in Gym</CardTitle>
                <CardDescription>These members are currently checked in</CardDescription>
              </CardHeader>
              <CardContent>
                {activeLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : activeCheckIns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No members currently checked in
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeCheckIns.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={record.member?.avatar_url || undefined} />
                            <AvatarFallback>
                              {record.member?.full_name?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{record.member?.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Checked in at {formatTime(record.check_in_time)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            {formatDuration(record.check_in_time, null)}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => checkOut.mutate({ attendanceId: record.id, gymId: gym.id })}
                            disabled={checkOut.isPending}
                          >
                            <LogOut className="h-4 w-4 mr-1" />
                            Check Out
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Attendance History</CardTitle>
                    <CardDescription>View past attendance records</CardDescription>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent>
                {attendanceLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : attendance.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No attendance records for {format(selectedDate, "MMMM d, yyyy")}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attendance.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={record.member?.avatar_url || undefined} />
                            <AvatarFallback>
                              {record.member?.full_name?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{record.member?.full_name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{formatTime(record.check_in_time)}</span>
                              <span>→</span>
                              <span>
                                {record.check_out_time
                                  ? formatTime(record.check_out_time)
                                  : "Still present"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              record.check_out_time
                                ? "bg-muted"
                                : "bg-success/10 text-success border-success/20"
                            )}
                          >
                            {formatDuration(record.check_in_time, record.check_out_time)}
                          </Badge>
                          {!record.check_out_time && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => checkOut.mutate({ attendanceId: record.id, gymId: gym.id })}
                              disabled={checkOut.isPending}
                            >
                              <LogOut className="h-4 w-4 mr-1" />
                              Check Out
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
                                <AlertDialogTitle>Delete Attendance Record</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this attendance record? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteAttendance.mutate({ attendanceId: record.id, gymId: gym.id })}
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
