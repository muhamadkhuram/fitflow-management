import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Payment {
  id: string;
  gym_id: string;
  member_id: string;
  amount: number;
  payment_type: "cash" | "transfer" | "stripe";
  description: string | null;
  payment_date: string;
  created_at: string;
  created_by: string;
}

export interface PaymentWithMember extends Payment {
  member?: {
    full_name: string;
    email: string;
  };
}

export function usePayments(gymId: string | undefined) {
  return useQuery({
    queryKey: ["payments", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          member:gym_members(full_name, email)
        `)
        .eq("gym_id", gymId)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data as PaymentWithMember[];
    },
    enabled: !!gymId,
  });
}

export function useMemberPayments(memberId: string | undefined) {
  return useQuery({
    queryKey: ["member-payments", memberId],
    queryFn: async () => {
      if (!memberId) return [];
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("member_id", memberId)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!memberId,
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payment: {
      gymId: string;
      memberId: string;
      amount: number;
      paymentType: "cash" | "transfer" | "stripe";
      description?: string;
      paymentDate?: string;
    }) => {
      const { data, error } = await supabase
        .from("payments")
        .insert([{
          gym_id: payment.gymId,
          member_id: payment.memberId,
          amount: payment.amount,
          payment_type: payment.paymentType,
          description: payment.description || null,
          payment_date: payment.paymentDate || new Date().toISOString(),
          created_by: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments", variables.gymId] });
      queryClient.invalidateQueries({ queryKey: ["member-payments", variables.memberId] });
      toast.success("Payment recorded successfully!");
    },
    onError: (error) => {
      toast.error("Failed to record payment: " + error.message);
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, gymId, memberId }: { id: string; gymId: string; memberId: string }) => {
      const { error } = await supabase
        .from("payments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, gymId, memberId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments", variables.gymId] });
      queryClient.invalidateQueries({ queryKey: ["member-payments", variables.memberId] });
      toast.success("Payment deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete payment: " + error.message);
    },
  });
}
