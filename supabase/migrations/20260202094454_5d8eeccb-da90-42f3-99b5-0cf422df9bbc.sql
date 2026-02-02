-- Create equipment status enum
CREATE TYPE public.equipment_status AS ENUM ('working', 'maintenance', 'needs_maintenance', 'out_of_order');

-- Create equipment categories table
CREATE TABLE public.equipment_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create equipment table
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.equipment_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  purchase_date DATE,
  status public.equipment_status NOT NULL DEFAULT 'working',
  maintenance_notes TEXT,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create equipment wishlist table
CREATE TABLE public.equipment_wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.equipment_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  estimated_cost NUMERIC,
  priority TEXT NOT NULL DEFAULT 'medium',
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.equipment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_wishlist ENABLE ROW LEVEL SECURITY;

-- Equipment categories policies
CREATE POLICY "Owners can view their gym equipment categories"
  ON public.equipment_categories FOR SELECT
  USING (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can create equipment categories"
  ON public.equipment_categories FOR INSERT
  WITH CHECK (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can update their equipment categories"
  ON public.equipment_categories FOR UPDATE
  USING (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can delete their equipment categories"
  ON public.equipment_categories FOR DELETE
  USING (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));

-- Equipment policies
CREATE POLICY "Owners can view their gym equipment"
  ON public.equipment FOR SELECT
  USING (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can create equipment"
  ON public.equipment FOR INSERT
  WITH CHECK (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can update their equipment"
  ON public.equipment FOR UPDATE
  USING (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can delete their equipment"
  ON public.equipment FOR DELETE
  USING (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));

-- Equipment wishlist policies
CREATE POLICY "Owners can view their gym equipment wishlist"
  ON public.equipment_wishlist FOR SELECT
  USING (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can create equipment wishlist items"
  ON public.equipment_wishlist FOR INSERT
  WITH CHECK (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can update their equipment wishlist"
  ON public.equipment_wishlist FOR UPDATE
  USING (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can delete their equipment wishlist items"
  ON public.equipment_wishlist FOR DELETE
  USING (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_equipment_categories_updated_at
  BEFORE UPDATE ON public.equipment_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_wishlist_updated_at
  BEFORE UPDATE ON public.equipment_wishlist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();