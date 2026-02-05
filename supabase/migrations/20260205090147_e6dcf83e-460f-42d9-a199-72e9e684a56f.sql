-- Create member tag enum
CREATE TYPE public.member_tag AS ENUM ('beginner', 'regular', 'vip');

-- Add tag column to gym_members
ALTER TABLE public.gym_members 
ADD COLUMN tag public.member_tag DEFAULT 'regular';

-- Add capacity to gyms table
ALTER TABLE public.gyms 
ADD COLUMN capacity INTEGER DEFAULT NULL;

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_activity_logs_gym_id ON public.activity_logs(gym_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Owners can view their gym activity logs
CREATE POLICY "Owners can view their gym activity logs"
ON public.activity_logs
FOR SELECT
USING (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));

-- Owners can create activity logs
CREATE POLICY "Owners can create activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid()));