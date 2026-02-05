 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "./useAuth";
 
 export interface ActivityLog {
   id: string;
   gym_id: string;
   user_id: string;
   action: string;
   entity_type: string;
   entity_id: string | null;
   entity_name: string | null;
   details: Record<string, any> | null;
   created_at: string;
 }
 
 export function useActivityLogs(gymId: string | undefined) {
   return useQuery({
     queryKey: ["activity-logs", gymId],
     queryFn: async () => {
       if (!gymId) return [];
       
       const { data, error } = await supabase
         .from("activity_logs")
         .select("*")
         .eq("gym_id", gymId)
         .order("created_at", { ascending: false })
         .limit(100);
 
       if (error) throw error;
       return data as ActivityLog[];
     },
     enabled: !!gymId,
   });
 }
 
 export function useLogActivity() {
   const queryClient = useQueryClient();
   const { user } = useAuth();
 
   return useMutation({
     mutationFn: async ({
       gymId,
       action,
       entityType,
       entityId,
       entityName,
       details,
     }: {
       gymId: string;
       action: string;
       entityType: string;
       entityId?: string;
       entityName?: string;
       details?: Record<string, any>;
     }) => {
       if (!user) throw new Error("User not authenticated");
 
       const { data, error } = await supabase
         .from("activity_logs")
         .insert([{
           gym_id: gymId,
           user_id: user.id,
           action,
           entity_type: entityType,
           entity_id: entityId || null,
           entity_name: entityName || null,
           details: details || null,
         }])
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: (_, variables) => {
       queryClient.invalidateQueries({ queryKey: ["activity-logs", variables.gymId] });
     },
   });
 }