-- Create storage bucket for member avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('member-avatars', 'member-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to member avatars
CREATE POLICY "Public can view member avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'member-avatars');

-- Allow gym owners to upload member avatars
CREATE POLICY "Gym owners can upload member avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'member-avatars' 
  AND auth.uid() IS NOT NULL
);

-- Allow gym owners to update member avatars
CREATE POLICY "Gym owners can update member avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'member-avatars' AND auth.uid() IS NOT NULL);

-- Allow gym owners to delete member avatars
CREATE POLICY "Gym owners can delete member avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'member-avatars' AND auth.uid() IS NOT NULL);

-- Add avatar_url to gym_members
ALTER TABLE public.gym_members ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create payments table for manual payment tracking
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_type TEXT NOT NULL DEFAULT 'cash', -- cash, transfer, stripe
  description TEXT,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Gym owners can view their payments
CREATE POLICY "Owners can view their gym payments"
ON public.payments FOR SELECT
USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

-- Gym owners can insert payments
CREATE POLICY "Owners can insert payments"
ON public.payments FOR INSERT
WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

-- Gym owners can update payments
CREATE POLICY "Owners can update payments"
ON public.payments FOR UPDATE
USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

-- Gym owners can delete payments
CREATE POLICY "Owners can delete payments"
ON public.payments FOR DELETE
USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));