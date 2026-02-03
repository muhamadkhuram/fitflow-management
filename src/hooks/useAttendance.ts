import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Attendance {
  id: string;
  gym_id: string;
  member_id: string;
  check_in_time: string;
  check_out_time: string | null;
  notes: string | null;
  created_at: string;
  member?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export function useAttendance(gymId: string | undefined, date?: Date) {
  return useQuery({
    queryKey: ["attendance", gymId, date?.toISOString().split("T")[0]],
    queryFn: async () => {
      if (!gymId) return [];
      
      let query = supabase
        .from("attendance")
        .select(`
          *,
          member:gym_members(id, full_name, email, avatar_url)
        `)
        .eq("gym_id", gymId)
        .order("check_in_time", { ascending: false });

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query
          .gte("check_in_time", startOfDay.toISOString())
          .lte("check_in_time", endOfDay.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Attendance[];
    },
    enabled: !!gymId,
  });
}

export function useActiveCheckIns(gymId: string | undefined) {
  return useQuery({
    queryKey: ["active-check-ins", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          *,
          member:gym_members(id, full_name, email, avatar_url)
        `)
        .eq("gym_id", gymId)
        .is("check_out_time", null)
        .order("check_in_time", { ascending: false });

      if (error) throw error;
      return data as Attendance[];
    },
    enabled: !!gymId,
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gymId, memberId, notes }: { gymId: string; memberId: string; notes?: string }) => {
      // Check if member already has an active check-in
      const { data: existing } = await supabase
        .from("attendance")
        .select("id")
        .eq("gym_id", gymId)
        .eq("member_id", memberId)
        .is("check_out_time", null)
        .maybeSingle();

      if (existing) {
        throw new Error("Member is already checked in");
      }

      const { data, error } = await supabase
        .from("attendance")
        .insert([{
          gym_id: gymId,
          member_id: memberId,
          notes: notes || null,
        }])
        .select(`
          *,
          member:gym_members(id, full_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data as Attendance;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attendance", variables.gymId] });
      queryClient.invalidateQueries({ queryKey: ["active-check-ins", variables.gymId] });
      toast.success("Member checked in successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ attendanceId, gymId }: { attendanceId: string; gymId: string }) => {
      const { data, error } = await supabase
        .from("attendance")
        .update({ check_out_time: new Date().toISOString() })
        .eq("id", attendanceId)
        .select(`
          *,
          member:gym_members(id, full_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data as Attendance;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attendance", variables.gymId] });
      queryClient.invalidateQueries({ queryKey: ["active-check-ins", variables.gymId] });
      toast.success("Member checked out successfully!");
    },
    onError: (error) => {
      toast.error("Failed to check out: " + error.message);
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ attendanceId, gymId }: { attendanceId: string; gymId: string }) => {
      const { error } = await supabase
        .from("attendance")
        .delete()
        .eq("id", attendanceId);

      if (error) throw error;
      return { attendanceId, gymId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attendance", variables.gymId] });
      queryClient.invalidateQueries({ queryKey: ["active-check-ins", variables.gymId] });
      toast.success("Attendance record deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete: " + error.message);
    },
  });
}
