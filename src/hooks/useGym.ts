import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Gym {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  fee_type: "weekly" | "monthly";
  fee_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GymMember {
  id: string;
  gym_id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  joined_at: string;
  is_active: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  avatar_url: string | null;
}

export interface JoinRequest {
  id: string;
  gym_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export function useGyms() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["gyms", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gyms")
        .select("*")
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Gym[];
    },
    enabled: !!user,
  });
}

export function useGym(gymId: string | undefined) {
  return useQuery({
    queryKey: ["gym", gymId],
    queryFn: async () => {
      if (!gymId) return null;
      const { data, error } = await supabase
        .from("gyms")
        .select("*")
        .eq("id", gymId)
        .maybeSingle();

      if (error) throw error;
      return data as Gym | null;
    },
    enabled: !!gymId,
  });
}

export function useCreateGym() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (gym: { name: string } & Partial<Omit<Gym, 'name'>>) => {
      const { data, error } = await supabase
        .from("gyms")
        .insert([{ 
          name: gym.name,
          description: gym.description,
          address: gym.address,
          city: gym.city,
          phone: gym.phone,
          email: gym.email,
          logo_url: gym.logo_url,
          cover_image_url: gym.cover_image_url,
          fee_type: gym.fee_type || "monthly",
          fee_amount: gym.fee_amount || 0,
          is_active: true,
          owner_id: user?.id 
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gyms"] });
      toast.success("Gym created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create gym: " + error.message);
    },
  });
}

export function useUpdateGym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...gym }: Partial<Gym> & { id: string }) => {
      const { data, error } = await supabase
        .from("gyms")
        .update(gym)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["gyms"] });
      queryClient.invalidateQueries({ queryKey: ["gym", data.id] });
      toast.success("Gym updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update gym: " + error.message);
    },
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (member: { 
      gymId: string; 
      fullName: string; 
      email: string; 
      phone?: string;
    }) => {
      const { data, error } = await supabase
        .from("gym_members")
        .insert([{
          gym_id: member.gymId,
          user_id: member.gymId, // Placeholder - will be the actual user when member app exists
          full_name: member.fullName,
          email: member.email,
          phone: member.phone || null,
          is_active: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gym-members", variables.gymId] });
      toast.success("Member added successfully!");
    },
    onError: (error) => {
      toast.error("Failed to add member: " + error.message);
    },
  });
}

export function useGymMembers(gymId: string | undefined) {
  return useQuery({
    queryKey: ["gym-members", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      const { data, error } = await supabase
        .from("gym_members")
        .select("*")
        .eq("gym_id", gymId)
        .order("joined_at", { ascending: false });

      if (error) throw error;
      return data as GymMember[];
    },
    enabled: !!gymId,
  });
}

export function useJoinRequests(gymId: string | undefined) {
  return useQuery({
    queryKey: ["join-requests", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      const { data, error } = await supabase
        .from("join_requests")
        .select("*")
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as JoinRequest[];
    },
    enabled: !!gymId,
  });
}

export function useUpdateJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, gymId }: { id: string; status: "approved" | "rejected"; gymId: string }) => {
      // Update join request status
      const { error: updateError } = await supabase
        .from("join_requests")
        .update({ status })
        .eq("id", id);

      if (updateError) throw updateError;

      // If approved, add member to gym
      if (status === "approved") {
        const { data: request, error: fetchError } = await supabase
          .from("join_requests")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;

        const { error: memberError } = await supabase
          .from("gym_members")
          .insert([{
            gym_id: gymId,
            user_id: request.gym_id, // Placeholder - in real app would be the actual user
            full_name: request.full_name,
            email: request.email,
            phone: request.phone,
          }]);

        if (memberError && !memberError.message.includes("duplicate")) {
          throw memberError;
        }
      }

      return { id, status };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["join-requests", variables.gymId] });
      queryClient.invalidateQueries({ queryKey: ["gym-members", variables.gymId] });
      toast.success(`Request ${variables.status}!`);
    },
    onError: (error) => {
      toast.error("Failed to update request: " + error.message);
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, gymId }: { id: string; gymId: string }) => {
      const { error } = await supabase
        .from("gym_members")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, gymId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gym-members", variables.gymId] });
      toast.success("Member removed successfully");
    },
    onError: (error) => {
      toast.error("Failed to remove member: " + error.message);
    },
  });
}
