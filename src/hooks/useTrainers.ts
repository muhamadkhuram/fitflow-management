import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGyms } from "./useGym";
import { toast } from "sonner";

export interface Trainer {
  id: string;
  gym_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  specializations: string[] | null;
  wage_amount: number;
  wage_type: string;
  hire_date: string | null;
  is_active: boolean;
  bio: string | null;
  avatar_url: string | null;
  emergency_contact: string | null;
  created_at: string;
  updated_at: string;
}

export function useTrainers() {
  const { data: gyms } = useGyms();
  const gym = gyms?.[0];
  const queryClient = useQueryClient();

  const { data: trainers, isLoading } = useQuery({
    queryKey: ["trainers", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return [];
      const { data, error } = await supabase
        .from("trainers")
        .select("*")
        .eq("gym_id", gym.id)
        .order("full_name");

      if (error) throw error;
      return data as Trainer[];
    },
    enabled: !!gym?.id,
  });

  const createTrainer = useMutation({
    mutationFn: async (newTrainer: Omit<Trainer, "id" | "gym_id" | "created_at" | "updated_at">) => {
      if (!gym?.id) throw new Error("Gym ID is required");
      const { data, error } = await supabase
        .from("trainers")
        .insert([{ ...newTrainer, gym_id: gym.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers", gym?.id] });
      toast.success("Trainer added successfully");
    },
    onError: (error) => {
      toast.error(`Error adding trainer: ${error.message}`);
    },
  });

  const updateTrainer = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Trainer> & { id: string }) => {
      const { data, error } = await supabase
        .from("trainers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers", gym?.id] });
      toast.success("Trainer updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating trainer: ${error.message}`);
    },
  });

  const deleteTrainer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trainers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers", gym?.id] });
      toast.success("Trainer deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting trainer: ${error.message}`);
    },
  });

  return {
    trainers,
    isLoading,
    createTrainer,
    updateTrainer,
    deleteTrainer,
  };
}
