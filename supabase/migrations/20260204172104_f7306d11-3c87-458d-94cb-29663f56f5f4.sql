-- Create trainers table
CREATE TABLE public.trainers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specializations TEXT[],
  wage_amount NUMERIC NOT NULL DEFAULT 0,
  wage_type TEXT NOT NULL DEFAULT 'monthly',
  hire_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  bio TEXT,
  avatar_url TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Owners can view their gym trainers"
ON public.trainers
FOR SELECT
USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can create trainers"
ON public.trainers
FOR INSERT
WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can update their trainers"
ON public.trainers
FOR UPDATE
USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can delete their trainers"
ON public.trainers
FOR DELETE
USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

-- Index for faster lookups
CREATE INDEX idx_trainers_gym_id ON public.trainers(gym_id);

-- Trigger for updated_at
CREATE TRIGGER update_trainers_updated_at
BEFORE UPDATE ON public.trainers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();