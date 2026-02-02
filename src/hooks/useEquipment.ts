import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type EquipmentStatus = "working" | "maintenance" | "needs_maintenance" | "out_of_order";

export interface EquipmentCategory {
  id: string;
  gym_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  gym_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  status: EquipmentStatus;
  maintenance_notes: string | null;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  category?: EquipmentCategory;
}

export interface EquipmentWishlistItem {
  id: string;
  gym_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  estimated_cost: number | null;
  priority: string;
  url: string | null;
  created_at: string;
  updated_at: string;
  category?: EquipmentCategory;
}

// Categories hooks
export function useEquipmentCategories(gymId: string | undefined) {
  return useQuery({
    queryKey: ["equipment-categories", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      const { data, error } = await supabase
        .from("equipment_categories")
        .select("*")
        .eq("gym_id", gymId)
        .order("name");

      if (error) throw error;
      return data as EquipmentCategory[];
    },
    enabled: !!gymId,
  });
}

export function useCreateEquipmentCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: { gymId: string; name: string; description?: string }) => {
      const { data, error } = await supabase
        .from("equipment_categories")
        .insert([{
          gym_id: category.gymId,
          name: category.name,
          description: category.description || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["equipment-categories", variables.gymId] });
      toast.success("Category created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create category: " + error.message);
    },
  });
}

export function useDeleteEquipmentCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, gymId }: { id: string; gymId: string }) => {
      const { error } = await supabase
        .from("equipment_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, gymId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["equipment-categories", variables.gymId] });
      queryClient.invalidateQueries({ queryKey: ["equipment", variables.gymId] });
      toast.success("Category deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete category: " + error.message);
    },
  });
}

// Equipment hooks
export function useEquipment(gymId: string | undefined) {
  return useQuery({
    queryKey: ["equipment", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      const { data, error } = await supabase
        .from("equipment")
        .select(`
          *,
          category:equipment_categories(*)
        `)
        .eq("gym_id", gymId)
        .order("name");

      if (error) throw error;
      return data as Equipment[];
    },
    enabled: !!gymId,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (equipment: {
      gymId: string;
      name: string;
      categoryId?: string;
      description?: string;
      brand?: string;
      model?: string;
      serialNumber?: string;
      purchaseDate?: string;
      quantity?: number;
      status?: EquipmentStatus;
    }) => {
      const { data, error } = await supabase
        .from("equipment")
        .insert([{
          gym_id: equipment.gymId,
          name: equipment.name,
          category_id: equipment.categoryId || null,
          description: equipment.description || null,
          brand: equipment.brand || null,
          model: equipment.model || null,
          serial_number: equipment.serialNumber || null,
          purchase_date: equipment.purchaseDate || null,
          quantity: equipment.quantity || 1,
          status: equipment.status || "working",
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["equipment", variables.gymId] });
      toast.success("Equipment added successfully!");
    },
    onError: (error) => {
      toast.error("Failed to add equipment: " + error.message);
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, gymId, ...updates }: Partial<Equipment> & { id: string; gymId: string }) => {
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.category_id !== undefined) updateData.category_id = updates.category_id;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.brand !== undefined) updateData.brand = updates.brand;
      if (updates.model !== undefined) updateData.model = updates.model;
      if (updates.serial_number !== undefined) updateData.serial_number = updates.serial_number;
      if (updates.purchase_date !== undefined) updateData.purchase_date = updates.purchase_date;
      if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.maintenance_notes !== undefined) updateData.maintenance_notes = updates.maintenance_notes;
      if (updates.last_maintenance_date !== undefined) updateData.last_maintenance_date = updates.last_maintenance_date;
      if (updates.next_maintenance_date !== undefined) updateData.next_maintenance_date = updates.next_maintenance_date;

      const { data, error } = await supabase
        .from("equipment")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, gymId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["equipment", result.gymId] });
      toast.success("Equipment updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update equipment: " + error.message);
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, gymId }: { id: string; gymId: string }) => {
      const { error } = await supabase
        .from("equipment")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, gymId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["equipment", variables.gymId] });
      toast.success("Equipment deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete equipment: " + error.message);
    },
  });
}

// Wishlist hooks
export function useEquipmentWishlist(gymId: string | undefined) {
  return useQuery({
    queryKey: ["equipment-wishlist", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      const { data, error } = await supabase
        .from("equipment_wishlist")
        .select(`
          *,
          category:equipment_categories(*)
        `)
        .eq("gym_id", gymId)
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EquipmentWishlistItem[];
    },
    enabled: !!gymId,
  });
}

export function useCreateWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: {
      gymId: string;
      name: string;
      categoryId?: string;
      description?: string;
      estimatedCost?: number;
      priority?: string;
      url?: string;
    }) => {
      const { data, error } = await supabase
        .from("equipment_wishlist")
        .insert([{
          gym_id: item.gymId,
          name: item.name,
          category_id: item.categoryId || null,
          description: item.description || null,
          estimated_cost: item.estimatedCost || null,
          priority: item.priority || "medium",
          url: item.url || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["equipment-wishlist", variables.gymId] });
      toast.success("Wishlist item added successfully!");
    },
    onError: (error) => {
      toast.error("Failed to add wishlist item: " + error.message);
    },
  });
}

export function useDeleteWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, gymId }: { id: string; gymId: string }) => {
      const { error } = await supabase
        .from("equipment_wishlist")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, gymId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["equipment-wishlist", variables.gymId] });
      toast.success("Wishlist item removed successfully!");
    },
    onError: (error) => {
      toast.error("Failed to remove wishlist item: " + error.message);
    },
  });
}
