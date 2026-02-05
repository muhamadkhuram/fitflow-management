 import { useMemo } from "react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
 import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { format, subDays, startOfDay, endOfDay } from "date-fns";
 
 interface AttendanceChartProps {
   gymId: string;
 }
 
 export function AttendanceChart({ gymId }: AttendanceChartProps) {
   const { data: weeklyData = [], isLoading } = useQuery({
     queryKey: ["attendance-chart", gymId],
     queryFn: async () => {
       const today = new Date();
       const sevenDaysAgo = subDays(today, 6);
       
       const { data, error } = await supabase
         .from("attendance")
         .select("check_in_time")
         .eq("gym_id", gymId)
         .gte("check_in_time", startOfDay(sevenDaysAgo).toISOString())
         .lte("check_in_time", endOfDay(today).toISOString());
 
       if (error) throw error;
       return data;
     },
     enabled: !!gymId,
   });
 
   const chartData = useMemo(() => {
     const days: { date: Date; label: string; visits: number }[] = [];
     const today = new Date();
     
     for (let i = 6; i >= 0; i--) {
       const date = subDays(today, i);
       days.push({
         date,
         label: format(date, "EEE"),
         visits: 0,
       });
     }
 
     weeklyData.forEach((record) => {
       const recordDate = new Date(record.check_in_time);
       const dayIndex = days.findIndex(
         (d) => d.date.toDateString() === recordDate.toDateString()
       );
       if (dayIndex !== -1) {
         days[dayIndex].visits++;
       }
     });
 
     return days;
   }, [weeklyData]);
 
   const chartConfig = {
     visits: {
       label: "Visits",
       color: "hsl(var(--primary))",
     },
   };
 
   if (isLoading) {
     return (
       <Card>
         <CardHeader>
           <CardTitle>Weekly Attendance</CardTitle>
           <CardDescription>Last 7 days check-in trends</CardDescription>
         </CardHeader>
         <CardContent className="h-[200px] flex items-center justify-center">
           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
         </CardContent>
       </Card>
     );
   }
 
   return (
     <Card>
       <CardHeader>
         <CardTitle>Weekly Attendance</CardTitle>
         <CardDescription>Last 7 days check-in trends</CardDescription>
       </CardHeader>
       <CardContent>
         <ChartContainer config={chartConfig} className="h-[200px] w-full">
           <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
             <XAxis 
               dataKey="label" 
               tickLine={false} 
               axisLine={false}
               fontSize={12}
             />
             <YAxis 
               tickLine={false} 
               axisLine={false}
               fontSize={12}
               allowDecimals={false}
             />
             <ChartTooltip content={<ChartTooltipContent />} />
             <Bar 
               dataKey="visits" 
               fill="var(--color-visits)" 
               radius={[4, 4, 0, 0]}
             />
           </BarChart>
         </ChartContainer>
       </CardContent>
     </Card>
   );
 }